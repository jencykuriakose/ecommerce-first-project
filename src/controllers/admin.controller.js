const utils = require("./utils");
const ProductModel = require("../models/product.model");
const UserModel = require("../models/userAuth.model");
const CategoryModel = require("../models/category.model");
const adminModel=require("../models/admin.model");
const orderModel=require("../models/order.model");
const {handleError}=require('../middleware/error-handler.middleware')
const { generateSalesReportExcel } = require('../config/excel');
// const { get } = require("mongoose");
const {generateSalesReport} =require("../config/pdfKit");
//  const orderModel = require("../models/order.model");

const userModel = new UserModel();
const productModel = new ProductModel();
const categoryModel = new CategoryModel();
//  const ordermodel=new orderModel();
const adminmodel=new adminModel();
 const ordermodel=new orderModel();

const getadminhome = async (req, res) => {
	const result=await adminmodel.getDashboardData();
	res.render("admin/dashboard",{
	totalRevenue: result.totalRevenue,
      totalOrdersCount: result.totalOrdersCount,
      totalProductsCount: result.totalProductsCount,
      totalCategoriesCount: result.totalCategoriesCount,
      currentMonthEarnings: result.currentMonthEarnings,
      activePage:'dashboard'
});
}

const getadminlogin = async (req, res) => {
	res.render("admin/login");
};

const getuserlist = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;

	const response = await userModel.fetchAllUsers(page, limit);
	if (response.status) {
		res.render("admin/users", {
			users: response.users,
			totalPages: response.totalPages,
			currentPage: response.currentPage,
			limit: response.limit,
			activePage: "users"
		});
	} else {
		throw new Error("Failed to fetch users");
	}
};

const PostLogin = async (req, res) => {
	if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
		if (req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASSWORD) {
			req.session.adminLoggedIn = true;
			return res.status(200).json({ status: true });
		} else {
			return res.status(400).json({ status: false, error: "Email or password is incorrect." });
		}
	} else {
		return res.status(400).json({ error: "Admin credentials are not set." });
	}
};

const PutBlockUser = async (req, res) => {
	const { id, action } = req.body;

	const user = await userModel.FindUserWithId(id, action);
	if (!user.status) {
		return res.send({ status: 404, message: "User is not found" });
	} else {
		return res.send({ status: 200, message: `User status updated.User ${action}ed succesfully.` });
	}
};

const GetCategories = async (req, res) => {
	const response = await categoryModel.fetchCategories();
	if (response.status) {
		res.render("admin/categories", { category: response.categories, activepage: "categories" });
	} else {
		res.render("admin/categories", { category: [] });
	}
};

const postCategories = async (req, res) => {
	const { name } = req.body;
	const response = await categoryModel.addCategory(name);
	if (response.status) {
		res.json({ status: true, message: response.message });
	} else {
		res.json({ status: false, message: response.message });
	}
};

const putCategory = async (req, res) => {
	const { id, status } = req.body;
	const response = await categoryModel.updateCategory(id, status);
	if (response.status) {
		res.status(200).json({ status: true });
	} else {
		res.status(400).json({ status: false });
	}
};

const AddProducts = async (req, res) => {
	res.render("admin/add-products");
};



const getReport=async(req,res)=>{
	try {
		const startDate = req.query.startDate;
		const endDate = req.query.endDate;
		let reportData;
		if (startDate == 'null' && endDate === 'null') {
		  reportData = await ordermodel.getorderData();
		  generateSalesReport(reportData, res);
		} else {
		  reportData = await ordermodel.getOrders(startDate, endDate);
		  generateSalesReport(reportData, res);
		}
	  } catch (error) {
		handleError(res, error);
	  }
}


const getGraphData=async (req,res)=>{
	try {
		const result = await adminmodel.graphData();
		if (result.status) {
		  res.json({
			labels: result.labels,
			sales: result.salesData,
			products: result.productsData,
			message: result.message,
			success: true,
		  });
		} else {
		  res.json({ success: false, message: result.message });
		}
	  } catch (error) {
		console.error('Error fetching chart data:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	  }
}



const ChartData=async (req,res)=>{
	try{
const result=await adminmodel.ChartData();
if(result.status){
	const {popularProducts}=result;
	const labels = popularProducts.map((product) => product.productName);
      const data = popularProducts.map((product) => product.totalOrders);
      const stocks = popularProducts.map((product) => product.stocks); // Fetch product stock data


	  return res.json({
        success: true,
        labels,
        data,
        stocks,
      });
	} else {
		return res.json({
		  success: false,
		  message: 'Oops! Something went wrong. Chart data not found.',
		});
	  
}
	}catch(error){
		console.error('error fetching chart data',error);
		res.status(500).json({success:false,message:'Internal server error'});
	}
}

const DisplayReport= async (req, res)=> {
	try {
	  const startDate = req.query.startDate;
	  const endDate = req.query.endDate;
	  console.log(startDate,endDate);
	  const reportData = await ordermodel.getOrders(startDate,endDate);
	  console.log(reportData)
	  return res.status(200).json(reportData)
	} catch (error) {
		handleError(res,error)
	}
  }

const GetReportExcel=async(req,res)=>{
	try {
		const startDate = req.query.startDate;
		const endDate = req.query.endDate;
		let reportData;
		if (startDate === 'null' && endDate === 'null') {
		  reportData = await ordermodel.getOrderData();
		} else {
		  reportData = await ordermodel.getOrders(startDate, endDate);
		}
		const workbook = await generateSalesReportExcel(reportData);
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
		await workbook.xlsx.write(res);
		res.end();
	} catch (error) {
		handleError(res,error)
	}
}




//   const get404=async (req,res)=>{
// 	res.status(404).render('user/404');
// };


	


module.exports = {
	getadminhome,
	getadminlogin,
	PostLogin,
	getuserlist,
	PutBlockUser,
	GetCategories,
	postCategories,
	putCategory,
	AddProducts,
    getReport,
	getGraphData,
	DisplayReport,
	ChartData,
	GetReportExcel
	// get404
	
};

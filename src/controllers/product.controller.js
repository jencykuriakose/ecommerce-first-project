const ProductModel = require("../models/product.model");
const CategoryModel = require("../models/category.model");
const {addProductSchema, updateproductschema } = require("../config/joi");


const productModel = new ProductModel();
const categoryModel = new CategoryModel();

const getProducts = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const productsResult = await productModel.GetAllproducts(page, limit);
	const categoryResult = await categoryModel.fetchCategories();
	res.render("admin/products", {
		products: productsResult.products,
		categories: categoryResult.categories,
		totalPages: productsResult.totalPages,
		currentPage: productsResult.currentPage,
		limit: productsResult.limit,
		activePage: "products"
	});
};

const GetAddproducts = async (req, res) => {
	const categoriesResult = await categoryModel.fetchCategories();
	return res.render("admin/add-products", {
		categories: categoriesResult.categories,
		activepage: "addproducts"
	});
};

const PostAddProduct = async (req, res) => {
	//const data = req.body;
	// console.log(data);
	if(req.fileValidationError){
return res.status(400).json({error:res.fileValidationError.message});
	}

	const validation=addProductSchema.validate(
		{...req.body,productImage:req.files},
		{abortEarly:false},
		);

		if (validation.error){
			return res.json({success:false,message:validation.error.details[0].message})
		}

	const productResult = await productModel.addNewProduct(req.body, req.files);
	if (productResult.status) {
		
		res.status(200).json({ success: true, message: "Product added succesfully" });
	} else {
		res.status(500).json({ success: false, message: "Failed to add product." });
	}
};


//get the edit product


const GetEditProduct = async (req, res) => {
	const productId = req.params.productId;
	const productResult = await productModel.getEditProduct(productId);
	const categoriesResult = await categoryModel.fetchCategories();
	console.log(productResult);
	if (productResult.status) {
		res.render("admin/update-products", {
			categories: categoriesResult.categories,
			product: productResult.product,
			activepage: "products"
		});
	} else {
		res.status(404).json({ error: "product not found" });
	}
};



//(edit)put the products

const PutEditProduct = async (req, res) => {
	const { productId } = req.body;
	const validation = updateproductschema.validate(
		{ ...req.body, productimage: req.files },
        {abortEarly:false},
		);
		if(validation.error){
			return res.status(400).json({success:false,message:validation.error.details[0].message});
		}
		  const productResult = await productModel.updateProduct(productId,req.body,req.files);
		
		if(productResult){ 
			return res.json({
				success:true,
				message:"product details updated successfully",
				data:productResult,
			});
		}
		else{
			return res.status({success:false,message:"failed to update product details"});
			
		}
};


//soft delete of the item

const deleteproduct = async (req, res) => {
	const productId = req.params.id;
	console.log(productId)
	 const productResult = await productModel.updateProductStatus(productId);
     if (productResult.status) {
		res.status(200).json({ success: true, message: "product deleted sucessfully" });
	} else {
		res.status(500).json({ status: false, message: "failed to delete product" });
	}
};

//user can view the product in shop page 

const getallproducts=async (req,res)=>{
	const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const sortBy = req.query.sortBy;



    const allProductsResult = await productModel.GetAllproducts(page, limit, sortBy);
    res.render('user/all-products',
	 {
      products: allProductsResult.products,
      totalPages: allProductsResult.totalPages,
      currentPage: allProductsResult.currentPage,
      limit: allProductsResult.limit,
      productCount: allProductsResult.productCount,
    });
}


//userview of products details

const LoadProductDetails = async (req, res) => {
	console.log(req.params);
	console.log(req.query);
	console.log(req.body);

	const productId = req.params.productId;

	const productResult = await productModel.LoadProductDetails(productId);
	console.log(productResult);
	const allproductResult = await productModel.GetAllproducts();

	if (productResult.status) {
		res.render("user/product", {
			product: productResult.product,
			products: allproductResult.products
		});
	} else {
		res.status(404).render("user/404", {
			message: "product is not found"
		});
	}
};
//Get edit product images

const GetProductImages = async (req, res) => {
	const images = await productModel.getProductImage(req.params.id);
	res.json(images);
};







module.exports = {
	getProducts,
	GetAddproducts,
	PostAddProduct,
	GetEditProduct,
	LoadProductDetails,
    deleteproduct,
	GetEditProduct,
	GetProductImages,
	PutEditProduct,
	getallproducts
	
};

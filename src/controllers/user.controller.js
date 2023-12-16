const utils = require("./utils");
const UserModel = require("../models/userAuth.model");
const ProductModel = require("../models/product.model");
const CategoryModel = require("../models/category.model");
const orderModel=require("../models/order.model");
const { signupvalidationSchema, updateUserSchema } = require("../config/joi");
const { json } = require("body-parser");
const bcrypt=require("bcrypt");
const uuidv4=require('uuidv4');
const userModel = new UserModel();

const categoryModel = new CategoryModel();
const productmodel = new ProductModel();
const ordermodel=new orderModel();

const getHome = async (req, res) => {
	const productResult = await productmodel.GetAllproducts();
	const categories = await categoryModel.fetchCategories();
	if (productResult) {
		res.status(200).render("user/home", {
			products: productResult.products,
			categories: categories,
			status: true
		});
	} else {
		res.status(500).json({ status: false });
	}
};

const getSignup = async (req, res) => {
	res.render("user/logins/signup");
};

const postSignup = async (req, res) => {
	const validation = signupvalidationSchema.validate(req.body, {
		abortEarly: false
	});
	if (validation.error) {
		return res.status(400).json({ error: validation.error.details[0].message });
	}

	const data = req.body;
	const isOtpCorrect = await utils.verifyOtp(data.phone, data.otp);
	if (!isOtpCorrect) return res.status(400).json({ error: "otp is invalid" });
	const { status, user } = await userModel.createUser(data);

	if (!status) return res.status(400).json({ error: "something wrong", status });
	req.session.user = user;
	req.session.userloggedIn = true;
	return res.json({ status: true });
};

const getLogin = async (req, res) => {
	res.render("user/logins/login");
};

const postSendOtp = async (req, res) => {
	const phone = req.body.phone;
	console.log(phone)
	const isSended = await utils.sendOtp(phone);
	if (!isSended) return res.send(false);
	req.session.phone = phone;
	res.send(true);
};

// normal login

const postloginverify = async (req, res) => {
	const { email, password } = req.body;
	console.log(email, password);
	try {
		const userResult = await userModel.CheckUserWithEmail(email, password);
		console.log(userResult)
		if (userResult?.status) {
			req.session.userloggedIn = true;
			req.session.user = userResult.user;
			console.log("session checking middleware" + req.session.user);
			res.status(200).json({ status: true, message: userResult?.message });
		} else {
			res.json({ status: false, message: userResult?.message });
		}
	} catch (error) {
		console.log(error.message);
	}
};

// otp-login

const getSignupLoginOtp = async (req, res) => {
	res.render("user/logins/otp-login");
};

const postOtpVerify = async (req, res) => {
	const otp = req.body.otp;
	const phone = req.session.phone;
	const status = await utils.verifyOtp(phone, otp);
	if (status == false) {
		res.status(400).json({ status: false });
	}
	res.status(200).json({ status: true });
};

const otpLoginOtpVerify = async (req, res) => {
	const phone = req.session.phone;
	res.render("user/logins/otp-verify", { phone });
};

const getaccount = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;

	const userData = req.session?.user;
	// console.log(userData)
	
	if (userData) {
		 const order= await ordermodel.fetchorderuserdetails(req.session.user._id,res,page,limit);
		return res.render("user/account", {
			userData: userData,
			 order: order.orderDetails,
			 address: order.addressDetails,
			 totalpage: order.totalpage,
			 currentpage: order.currentpage,
			 limit: order.limit
		});
	}
	return res.render("user/account", { userData });
};



       // forgot password


const GenerateUniquePassword=async(req,res)=>{
	res.render('user/logins/forgot-password')
	return uuidv4();
}

const forgotPass = async (req,res) =>{
    const email = req.body.email;

    try {
        const user = await user.findOne({ email });

        if (!user) {
            return res.render('forgot-password', { errorMessage: 'User not found' });
        }

        const resetToken = generateUniqueToken();
        const resetTokenExpiration = Date.now() + 60 * 60 * 1000; // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();
        sendPasswordResetEmail(user.email, resetToken);

        // Render the confirmation page with the user's email

        return res.render('passConfirmation', { email: user.email });
    } catch (error) {
        console.error('Error in forgot-password route:', error);
        return res.render('error-page', { errorMessage: 'Error processing request' });
    }
	
};




















const updateuserdata = async (req, res) => {
	const { error, value } =  updateUserSchema.validate(req.body);
	console.log(req.body,req.file)
	if (error) {
		throw new Error(error.details[0].message);
	  }
	const updateResult = await userModel.updateuserdata(value,req.file,req.session.user._id);
	if (updateResult.status) {
		if (updateResult.user) {
			req.session.user = updateResult.user;
		}
		return res.json({ status: true, message: updateResult?.message });
	} else {
		return res.json({ status: false, message: updateResult?.message });
	}
};

const getlogout = (req, res) => {
	req.session.destroy();
	res.redirect("/");
};

module.exports = {
	getSignup,
	getHome,
	getLogin,
	postSignup,
	postSendOtp,
	getSignupLoginOtp,
	postOtpVerify,
	otpLoginOtpVerify,
	getaccount,
	postloginverify,
	//  LoadProductDetails,
	updateuserdata,
	getlogout,
	GenerateUniquePassword
};

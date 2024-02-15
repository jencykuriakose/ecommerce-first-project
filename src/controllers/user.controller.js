const utils = require("./utils");
const UserModel = require("../models/userAuth.model");
const ProductModel = require("../models/product.model");
const Address = require("../schema/address.schema");
const CategoryModel = require("../models/category.model");
const userSchema = require("../schema/user.schema");
const orderModel = require("../models/order.model");
const { signupvalidationSchema, updateUserSchema, resetPasswordSchema } = require("../config/joi");
const { json } = require("body-parser");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const uuidv4 = require("uuidv4");
const { getOrderDetails } = require("./order.controller");
const { generateInvoice } = require("../config/pdfKit");
const { handleError } = require("../middleware/error-handler.middleware");
const Mail = require("nodemailer/lib/mailer");
const transactionHistory = require("../schema/transaction.history");

const userModel = new UserModel();

const categoryModel = new CategoryModel();
const productmodel = new ProductModel();
const ordermodel = new orderModel();

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

function generateReferralCode(length) {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let referralCode = "";

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		referralCode += characters.charAt(randomIndex);
	}

	return referralCode;
}

const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000);
};

// const postSignup = async (req, res) => {
// 	const validation = signupvalidationSchema.validate(req.body, {
// 		abortEarly: false
// 	});
// 	console.log("Call 1");
// 	// if (validation.error) {
// 	// 	return res.status(400).json({ error: validation.error.details[0].message });
// 	// }
// 	console.log("Call 2");
// 	const data = req.body;

// 	if (data.referral) {
//         const referredUser = await userSchema.findOne({referral:data.referral});
//         if (!referredUser) {
//             return res.status(400).json({ error: "Invalid referral code" });
//         }
//     }

// 	const referralCode = generateReferralCode(8);
// 	console.log("Data",data);
// 	const isOtpCorrect = await utils.verifyOtp(data.phone, data.otp);
// 	if (!isOtpCorrect) return res.status(400).json({ error: "otp is invalid" });
// 	if(!isOtpCorrect){console.log("verification failed");}
// 	const { status, user } = await userModel.createUser(data, referralCode);

// 	if (!status) return res.status(400).json({ error: "something wrong", status });
// 	req.session.user = user;
// 	req.session.userloggedIn = true;
// 	return res.json({ status: true });
// };

const postSignup = async (req, res) => {
	// const validation = signupvalidationSchema.validate(req.body, {
	// 	abortEarly: false
	// });
	// console.log(validation);
	// // Handle validation error
	// if (validation.error) {
	// 	return res.status(400).json({ error: validation.error.details[0].message });
	// }

	const data = req.body;
	console.log(data, "-----------");
	if (data.referral) {
		const referredUser = await userSchema.findOne({ referral: data.referral });
		console.log(referredUser);
		if (!referredUser) {
			return res.status(400).json({ error: "Invalid referral code" });
		}
	}

	const referralCode = generateReferralCode(8);
	// const isOtpCorrect = await utils.verifyOtp(data.email, data.otp);
	console.log(typeof data.otp, typeof req.session.otp);
	if (parseInt(data.otp) != req.session.otp) {
		// Handle OTP verification result
		// if (!isOtpCorrect) {
		return res.status(400).json({ error: "OTP is invalid" });
	}

	const { status, user } = await userModel.createUser(data, referralCode);
	// Handle user creation result
	if (!status) {
		return res.status(400).json({ error: "Something went wrong", status });
	}

	// Session setup and response for successful user creation
	req.session.user = user;
	req.session.userloggedIn = true;
	return res.json({ status: true });
};

const getLogin = async (req, res) => {
	res.render("user/logins/login");
};

// const postSendOtp = async (req, res) => {
// 	const phone = req.body.phone;
// 	console.log(phone+'hello')
// 	const isSended = await utils.sendOtp(phone);
// 	if (!isSended) return res.send(false);
// 	req.session.phone = phone;
// 	res.send(true);
// };
// user.controller.js

const postSendOtp = async (req, res) => {
	try {
		const email = req.body.emailValue;
		console.log("Email:1"); // Log the email to verify its correctness
		const otp = generateOTP();

		// Send OTP email
		req.session.otp = otp;
		req.session.email = email;
		const isSent = await utils.sendOtp(req.session.email, otp);

		if (!isSent) {
			return res.status(500).send({ error: "Failed to send OTP email" });
		}

		return res.status(200).send({ success: true });
	} catch (error) {
		console.error("Error sending OTP email:", error);
		return res.status(500).send({ error: "Internal server error" });
	}
};

const resentOtp = async (req, res, next) => {
	// let code = 200
	// const isSended = await utils.sendOtp(req.session.phone)
	// if(!isSended) code = 400
	// res.status(code).json({status:true})
	let code = 200;
	const otp = generateOTP();
	const isSended = await utils.sendOtp(req.session.email, otp);
	res.status(code).json({ status: true });
};

// normal login

const postloginverify = async (req, res) => {
	const { email, password } = req.body;
	console.log(email, password);
	try {
		const userResult = await userModel.CheckUserWithEmail(email, password);
		console.log(userResult);
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
	const email = req.session.email;
	const status = await utils.verifyOtp(email, otp);
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
		const order = await ordermodel.fetchorderuserdetails(req.session.user._id, res, page, limit);
		return res.render("user/account", {
			userData: userData,
			order: order.orderDetails,
			address: order.addresses,
			//  addressDetails,
			totalpage: order.totalPages,
			currentpage: order.currentPage,
			limit: order.limit
		});
	}
	return res.render("user/account", { userData });
};

// forgot password

const GenerateUniquePassword = async (req, res) => {
	res.render("user/logins/forgot-password");
	return uuidv4();
};

const forgotPass = async (req, res) => {
	const email = req.body.email;

	try {
		const user = await user.findOne({ email });

		if (!user) {
			return res.render("forgot-password", { errorMessage: "User not found" });
		}

		const resetToken = generateUniqueToken();
		const resetTokenExpiration = Date.now() + 60 * 60 * 1000; // 1 hour

		user.resetToken = resetToken;
		user.resetTokenExpiration = resetTokenExpiration;
		await user.save();
		sendPasswordResetEmail(user.email, resetToken);

		// Render the confirmation page with the user's email

		return res.render("passConfirmation", { email: user.email });
	} catch (error) {
		console.error("Error in forgot-password route:", error);
		return res.render("error-page", { errorMessage: "Error processing request" });
	}
};

const updateuserdata = async (req, res) => {
	const { error, value } = updateUserSchema.validate(req.body);
	console.log(req.body, req.file);
	if (error) {
		throw new Error(error.details[0].message);
	}
	const updateResult = await userModel.updateuserdata(value, req.file, req.session.user._id);
	if (updateResult.status) {
		if (updateResult.user) {
			req.session.user = updateResult.user;
		}
		return res.json({ status: true, message: updateResult?.message });
	} else {
		return res.json({ status: false, message: updateResult?.message });
	}
};

const updateAddress = async (req, res) => {
    console.log("kittyyyy");
    const { addressId } = req.params; // Assuming addressId is passed as a route parameter
    const { fname, country, city, street_address, state, zipcode, email, phone } = req.body;
	console.log(req.body.addressId);
	console.log(fname, country, city, street_address, state, zipcode, email, phone );
    // Check if all required fields are present
    if (!street_address || !state || !zipcode || !email || !phone) {
        return res.status(400).json({ status: false, message: 'Missing required fields' });
    }

    try {
        // Find the address by ID
        let address = await Address.findById(addressId);

        // Update address fields
        address.fname = fname;
        address.country = country;
        address.city = city;
        address.street_address = street_address;
        address.state = state;
        address.zipcode = zipcode;
        address.email = email;
        address.phone = phone;

        // Save the updated address
        await address.save();

        res.json({ status: true, message: 'Address updated successfully' });
    } catch (error) {
        console.error('Error updating address:', error.message);
        res.status(500).json({ status: false, message: 'Failed to update address' });
    }
};


const getlogout = (req, res) => {
	req.session.destroy();
	res.redirect("/");
};

const getInvoice = async (req, res) => {
	try {
		const id = req.query.id;
		const invoiceData = await ordermodel.OrderDetails(id);
		generateInvoice(invoiceData, res);
	} catch (error) {
		handleError(res, error);
	}
};

const ResetPassword = async (req, res) => {
	try {
		const { phone, password } = req.body;
		const { error } = resetPasswordSchema.validate({ password });
		if (error) {
			return res.status(400).json({ status: false, message: error.details[0].message });
		}
		const UpdatePassword = await userModel.ResetPassword(phone, password);
		if (UpdatePassword.status) {
			return res.json({ status: true, message: "password reset sucessfully" });
		} else {
			return res.json({ status: false, message: "failed to reset password" });
		}
	} catch (error) {
		handleError(res, error);
	}
};

const get404 = async (req, res) => {
	res.status(404).render("user/404");
};

module.exports = {
	getSignup,
	getHome,
	getLogin,
	postSignup,
	postSendOtp,
	resentOtp,
	getSignupLoginOtp,
	postOtpVerify,
	otpLoginOtpVerify,
	getaccount,
	postloginverify,
	//  LoadProductDetails,
	updateuserdata,
	getlogout,
	GenerateUniquePassword,
	ResetPassword,
	getInvoice,
	get404,
	updateAddress
};

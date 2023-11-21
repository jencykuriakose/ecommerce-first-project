const utils = require("./utils");
const UserModel = require("../models/userAuth.model");

const userModel = new UserModel();

const getHome = async (req, res) => {
	res.render("home");
};

const getSignup = async (req, res) => {
	res.render("user/login/signup");
};

const postSignup = async (req, res) => {
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
	res.render("user/login/login");
};

const postSignupSendOtp = async (req, res) => {
	const phone = req.body.phone;
	const isPhoneExist = await userModel.findByPhone(phone);
	if (isPhoneExist) return res.send(false);
	const isSended = await utils.sendOtp(phone);
	if (!isSended) return res.send(false);
	res.send(true);
};

const getSignupLoginOtp = async (req, res) => {
	res.render("user/login/login-otp");
};

const postLoginOtpVerify = async (req, res) => {
	const phone = req.body.phone;
	const isPhoneExist = await userModel.findByPhone(phone);
	if (!isPhoneExist) return res.status(400).json({ status: false }); //phone number already registered
	const isSended = await utils.sendOtp(phone);
	if (!isSended) return res.status(400).json({ status: false }); //phone number already registered
	req.session.phone = phone;
	res.status(200).json({ status: true });
};

const otpLoginOtpVerify = async (req, res) => {
	const phone = req.session.phone;
	res.render("user/login/otp-verify", { phone });
};

module.exports = {
	getSignup,
	getHome,
	getLogin,
	postSignup,
	postSignupSendOtp,
	getSignupLoginOtp,
	postLoginOtpVerify,
	otpLoginOtpVerify
};

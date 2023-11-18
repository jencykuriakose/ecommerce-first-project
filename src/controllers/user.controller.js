const { sendOtp, verifyOtp } = require("./utils");
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
	const isOtpCorrect = await verifyOtp(data.phone, data.otp);
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

const postSendOtp = async (req, res) => {
	const phone = req.body.phone;
	const isPhoneExist = await userModel.findByPhone(phone);
	if (isPhoneExist) return res.send(true);
	const isSended = await sendOtp(phone);
	if (!isSended) return res.send(false);
	res.send(true);
};

module.exports = {
	getSignup,
	getHome,
	getLogin,
	postSignup,
	postSendOtp
};

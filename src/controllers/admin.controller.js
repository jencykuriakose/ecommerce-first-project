const utils = require("./utils");
const productModel = require("../models/product.model")
const UserModel = require("../models/userAuth.model");

const userModel = new UserModel();

const getadminhome = async (req, res) => {
	res.render("admin/dashboard");
};

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
	//console.log("🤣");

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

const getproducts = async (req, res) => {
    const product = productModel.()	
	res.render("admin/products",{});
 };

module.exports = {
	getadminhome,
	getadminlogin,
	PostLogin,
	getuserlist,
    getproducts,
};

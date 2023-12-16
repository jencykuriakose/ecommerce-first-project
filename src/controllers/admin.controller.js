const utils = require("./utils");
const ProductModel = require("../models/product.model");
const UserModel = require("../models/userAuth.model");
const CategoryModel = require("../models/category.model");
// const { get } = require("mongoose");

const userModel = new UserModel();
const productModel = new ProductModel();
const categoryModel = new CategoryModel();

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

module.exports = {
	getadminhome,
	getadminlogin,
	PostLogin,
	getuserlist,
	PutBlockUser,
	GetCategories,
	postCategories,
	putCategory,
	AddProducts
};

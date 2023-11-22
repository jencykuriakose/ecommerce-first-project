const express = require("express");

const adminRouter = express.Router();

const adminController = require("../controllers/admin.controller");

adminRouter.route("/").get(adminController.getadminlogin);

adminRouter.route("/login").get(adminController.getadminlogin).post(adminController.PostLogin);

adminRouter.route("/users").get(adminController.getuserlist);

adminRouter.route("/dashboard").get(adminController.getadminhome);

adminRouter.route("/products").get(adminController.getproducts);

module.exports = adminRouter;

const express = require("express");
const userController = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.route("/").get(userController.getHome);

userRouter.route("/signup").get(userController.getSignup).post(userController.postSignup);

userRouter.route("/signup-otp").post(userController.postSendOtp)

userRouter.route("/login").get(userController.getLogin);

module.exports = userRouter;

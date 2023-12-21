const express = require("express");

const userController = require("../controllers/user.controller");

const productController = require("../controllers/product.controller");

const cartController=require("../controllers/cart.controller");

const orderController=require("../controllers/order.controller");

const { IsLoggedIn, IsLoggedOut } = require("../middleware/auth.middleware");

const { LoadProductDetails } = require("../controllers/product.controller");

const upload = require("../config/multer");

const userRouter = express.Router();







userRouter.route("/").get(userController.getHome);

userRouter.route("/signup").get(userController.getSignup).post(userController.postSignup);

userRouter.route("/signup-otp").post(userController.postSendOtp);

userRouter.route("/otp-login").get(userController.getSignupLoginOtp).post(userController.postSendOtp);

userRouter.route("/otp-verify").get(userController.otpLoginOtpVerify).post(userController.postOtpVerify);

userRouter.route("/login").get(userController.getLogin);

userRouter.route("/login").post(userController.postloginverify);

 userRouter.route('/forgot-password').get(userController.GenerateUniquePassword);

userRouter.route("/account").get(IsLoggedIn,userController.getaccount);

// userRouter.route('/update-userdata',(req,res,next)=>{console.log(req.file);},'/update-userdata',upload.single('profileimage')),userController.updateuserdata);
// userRouter.route('/update-userdata').post(upload.single('profileimage'),userController.updateuserdata)

userRouter.route('/update-userdata').post(upload.single('profileimage'), userController.updateuserdata);

userRouter.route("/product/:productId").get(productController.LoadProductDetails);

userRouter.route("/shop").get(productController.getallproducts);

userRouter.route("/cart").get(cartController.GetCart);

userRouter.route("/cart").post(cartController.PostToCart);

userRouter.route('/cart').patch(IsLoggedIn,cartController.UpdateQuantity);

userRouter.route('/cart').delete(IsLoggedIn,cartController.RemoveFromCart);

userRouter.route('/clear-cart').delete(IsLoggedIn,cartController.ClearCart);

userRouter.route('/checkout').get(IsLoggedIn,orderController.GetCheckOut);

userRouter.route('/checkout').post(IsLoggedIn,orderController.PostCheckOut);

userRouter.route('/order-successfull/:id').get(IsLoggedIn,orderController.SuccessPage);

userRouter.route('/order-cancel').post(IsLoggedIn,orderController.CancelOrder);

userRouter.route('/order-details').get(IsLoggedIn,orderController.getOrderDetails);

userRouter.route('/add-address').post(IsLoggedIn,orderController.AddAddress);

userRouter.route('/delete-address').delete(IsLoggedIn,orderController.DeleteAddress);

userRouter.route('/logout').get(userController.getlogout);


module.exports = userRouter;

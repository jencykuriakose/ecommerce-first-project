const express = require("express");

const userController = require("../controllers/user.controller");

const productController = require("../controllers/product.controller");

const cartController=require("../controllers/cart.controller");

const orderController=require("../controllers/order.controller");

const { IsLoggedIn, IsLoggedOut } = require("../middleware/auth.middleware");

const { LoadProductDetails } = require("../controllers/product.controller");

const couponController=require("../controllers/coupon.controller");

const upload = require("../config/multer");

const userRouter = express.Router();






            // home

userRouter.route("/").get(userController.getHome);

           // signup

userRouter.route("/signup").get(userController.getSignup).post(userController.postSignup);

userRouter.route("/signup-otp").post(userController.postSendOtp);

userRouter.route("/otp-login").get(userController.getSignupLoginOtp).post(userController.postSendOtp);

userRouter.route("/otp-verify").get(userController.otpLoginOtpVerify).post(userController.postOtpVerify);

userRouter.route('/resentOtp').get(userController.resentOtp)

userRouter.route("/login").get(userController.getLogin);

userRouter.route("/login").post(userController.postloginverify);

 userRouter.route('/forgot-password').get(userController.GenerateUniquePassword);

 userRouter.route('/ResetPassword').post(userController.ResetPassword);
 
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

userRouter.route('/verify-payment').post(IsLoggedIn, orderController.VerifyPayment)

userRouter.route('/order-successfull/:id').get(IsLoggedIn,orderController.SuccessPage);

userRouter.route('/order-cancel').post(IsLoggedIn,orderController.CancelOrder);

userRouter.route('/order-details').get(IsLoggedIn,orderController.getOrderDetails);

userRouter.route('/order-return').post(IsLoggedIn,orderController.returnOrder);

userRouter.route('/add-address').post(IsLoggedIn,orderController.AddAddress);

userRouter.route('/delete-address').delete(IsLoggedIn,orderController.DeleteAddress);

userRouter.route('/logout').get(userController.getlogout);

userRouter.route('/wallet').get(IsLoggedIn,orderController.GetWallet);

userRouter.route('/apply-wallet').post(IsLoggedIn,orderController.ApplyWallet);

// userRouter.route('*').get(userController.get404);

userRouter.route('/invoice').get(userController.getInvoice);

 userRouter.route('/wishlist').get(IsLoggedIn,cartController.getWishlist);

 userRouter.route('/wishlist').post(IsLoggedIn,cartController.postWishlist);

 userRouter.route('/wishlist').delete(IsLoggedIn,cartController.RemoveFromWishlist);

 userRouter.route('/search-result').get(productController.ProductBySearch);

 userRouter.route('/')

                           //  coupon

userRouter.route('/apply-coupon').post(couponController.ApplyCoupon);

userRouter.route('/remove-coupon').put(couponController.RemoveCoupon);





module.exports = userRouter;

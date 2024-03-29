const express = require("express");

const adminRouter = express.Router();

const adminController = require("../controllers/admin.controller");

const { IsAdminLoggedIn, IsAdminLoggedOut } = require("../middleware/auth.middleware");

const productController = require("../controllers/product.controller");

const ordercontroller=require("../controllers/order.controller");

const upload = require("../config/multer");

const { get404 } = require("../controllers/user.controller");

const couponController=require("../controllers/coupon.controller");

adminRouter.route("/");

adminRouter.route("/login").get(adminController.getadminlogin).post(adminController.PostLogin);

adminRouter.route("/users").get(IsAdminLoggedIn, adminController.getuserlist);

adminRouter.route("/").get(IsAdminLoggedIn, adminController.getadminhome);

adminRouter.route("/products").get(IsAdminLoggedIn, productController.getProducts);

adminRouter
	.route("/add-products")
	.get(IsAdminLoggedIn, productController.GetAddproducts)
	.post(IsAdminLoggedIn, upload.array("productImage", 4), productController.PostAddProduct);

adminRouter.route("/getProductImages/:id").get(IsAdminLoggedIn, productController.GetProductImages);

adminRouter.route("/edit-product/:productId").get(IsAdminLoggedIn, productController.GetEditProduct);

 adminRouter.route("/edit-product").put( upload.array('productImage',4),
IsAdminLoggedIn,
productController.PutEditProduct);

adminRouter.route("/product-status/:id").put(IsAdminLoggedIn,productController.deleteproduct);

adminRouter.route('/orders').get(ordercontroller.getorderpage);

adminRouter.route('/order-status').post(IsAdminLoggedIn,ordercontroller.changeOrderStatus);

adminRouter.route('/order-details').get(IsAdminLoggedIn,ordercontroller.getOrderDetails);

adminRouter.route("/user-status").put(IsAdminLoggedIn, adminController.PutBlockUser);

adminRouter.route("/categories").get(IsAdminLoggedIn, adminController.GetCategories).post(IsAdminLoggedIn, adminController.postCategories);

adminRouter.route("/category-status").put(IsAdminLoggedIn, adminController.putCategory);

//  adminRouter.route("/sales-report").get(IsAdminLoggedIn,adminController.getReport);

 adminRouter.route("/sales-report").get(IsAdminLoggedIn,adminController.DisplayReport);

 adminRouter.route('/sales-report/download').get(IsAdminLoggedIn,adminController.getReport);

adminRouter.route('/sales-report/download-excel').get(IsAdminLoggedIn,adminController.GetReportExcel);

adminRouter.route("/graph").get(IsAdminLoggedIn,adminController.getGraphData);

  adminRouter.route("/chart").get(IsAdminLoggedIn,adminController.fetchChartData);

// adminRouter.route('*').get(adminController.get404);

                //    coupon management 

adminRouter.route("/coupons").get(IsAdminLoggedIn,couponController.GetCoupon);

adminRouter.route("/coupons").post(IsAdminLoggedIn,couponController.AddCoupon);

adminRouter.route("/coupon-status").put(IsAdminLoggedIn,couponController.ChangeCouponStatus);


module.exports = adminRouter;

const productDatabase = require("../schema/product.schema");
// const cartModel = require('../models/cart.model');
const cartModel = require("../models/cart.model");
const orderModel = require("../models/order.model");

const ordermodel = new orderModel();
const cartmodel = new cartModel();

// admin view the order page

const getorderpage = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;

	const orderResult = await ordermodel.getallorders(page, limit);
	if (orderResult.status) {
		return res.render("admin/orders", {
			orders: orderResult.orders,
			message: orderResult.message,
			totalPages: orderResult.totalPages,
			currentPage: orderResult.currentPage,
			limit: orderResult.limit,
			activePage: "orders"
		});
	} else {
		return res.render("admin/orders", {
			orders: [],
			message: orderResult.message,
			totalPages: orderResult.totalPages,
			currentPage: orderResult.currentPage,
			limit: orderResult.limit,
			activePage: "orders"
		});
	}
};

// user order page

const GetCheckOut = async (req, res) => {
	const cartResult = await cartmodel.cartProductTotal(req.session.user._id);
	if (cartResult.cart) {
		cartResult.cart.items.forEach(async (item) => {
			const product = await productDatabase.find({ _id: item.product });
			if (product[0].stocks < item.quantity) {
				return res.redirect("/cart");
			}
		});
		const result = await ordermodel.getAddress(req.session.user._id, res);
		// const userWallet = await getUserData(req.session.user._id);
		if (cartResult.status) {
			if (result.status) {
				// let discountAmount;
				// let couponcode;
				// if (req.session.coupon) {
				//   const coupon = req.session.coupon;
				//   couponcode = coupon.code;
				//   discountAmount = (coupon.discount / 100) * cartResult.cart.total;
				// } else {
				//   discountAmount = 0;
				//   couponcode = null;
				// }

				// let appliedWallet;
				// if(req.session.appliedWallet){
				//   appliedWallet = req.session.appliedWallet
				// }

				return res.render("user/checkout", {
					addresses: result.addresses
					//   walletAmount: userWallet.amount,
					//   coupons: coupons,
					//   couponDiscount: discountAmount,
					//   couponcode: couponcode,
					//   appliedWallet:appliedWallet
				});
			} else {
				return res.render("user/checkout", {
					addresses: []
					//   walletAmount: userWallet.amount,
					//   coupons: [],
				});
			}
		} else {
			return res.redirect("/cart");
		}
	}
};

const PostCheckOut = async (req, res) => {
	const { paymentmethod, addressId } = req.body;
	const checkoutResult = await ordermodel.AddOrderDetails(addressId, paymentmethod, req.session.user._id, req, res);

	let cartTotal = checkoutResult.cartResult.total;

	// if(req.session.coupon){
	//   let coupon = req.session.coupon;
	//   const discountAmount = (coupon.discount / 100) * cartTotal;
	//   cartTotal = cartTotal - discountAmount;
	// }

	// if(req.session.appliedWallet){
	//   cartTotal = cartTotal - req.session.appliedWallet;
	// }

	if (cartTotal < 1) {
		await orderStatus(checkoutResult.order._id);
		return res.json({
			success: true,
			paymethod: "COD",
			message: "order details added!Order with wallet amount",
			orderId: checkoutResult.order._id
		});
	}

	if (checkoutResult.status) {
		if (paymentmethod === "cashOnDelivery") {
			return res.json({
				success: true,
				paymethod: "COD",
				message: "order details added!",
				orderId: checkoutResult.order._id
			});
			//   } else if (paymentmethod === 'razorpay') {
			//     const razorPayOrder = await generateRazorpay(checkoutResult.order);
			//     return res.json({
			//       success: true,
			//   paymethod: 'ONLINE',
			//   message: 'order details added!',
			//   order: razorPayOrder,
			// });
		}
	} else {
		return res.json({ success: false, message: "something goes wrong" });
	}
};

const AddAddress = async (req, res) => {
	const addressresult = await ordermodel.AddAddress(req.body, req.session.user._id, res);
	if (addressresult.status) {
		return res.json({ success: true, message: addressresult.message });
	} else {
		return res.json({ success: false, message: addressresult.message });
	}
};

const SuccessPage = async (req, res) => {
	const id = req.params.id;
	await ordermodel.setSuccessStatus(id);

	res.render("user/success-page");
};


const getOrderDetails=async (req,res) => {
const orderId=req.query.id;
const admin=req.query.admin;
const result=await ordermodel.OrderDetails(orderId);
if(result.status){
	if(admin && req.session.adminLoggedIn){
		return res.render('admin/order-details',{
			orderData:result.orderData,
			activepage:'orders',
		});
	}
	return res.render('user/order-details',{orderData:result.orderData});
}
else{
return res.render('sorry page is not found');
	}

}


const DeleteAddress=async (req,res)=>{
	const addressResult = await ordermodel.deleteAddress(req.body.id);
    if (addressResult) {
      res.redirect('/account');
    } else {
      res.redirect('/account');
    }
}


const CancelOrder=async (req,res)=>{
	const {id,cancelreason}=req.body;
	const cancelResult=await ordermodel.cancelorder(id,cancelreason);
	if(cancelResult){
res.json({ message: 'order canceled successfully', success: true });
    } else {
      res.json({ success: false, message: 'something wrong! cancelled operation failed' });
    }


}










module.exports = {
	getorderpage,
	GetCheckOut,
	PostCheckOut,
	AddAddress,
	SuccessPage,
	getOrderDetails,
	DeleteAddress,
	CancelOrder
	
}
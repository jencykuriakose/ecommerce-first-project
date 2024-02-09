const productDatabase = require("../schema/product.schema");
// const cartModel = require('../models/cart.model');
const cartModel = require("../models/cart.model");
const orderModel = require("../models/order.model");
const couponModel=require("../models/coupon.model");
const transactionDatabase=require("../schema/transaction.history");
const Razorpay=require("../config/rayzorpay");
const { handleError } = require("../middleware/error-handler.middleware");
const { LogInstance } = require("twilio/lib/rest/serverless/v1/service/environment/log");

const ordermodel = new orderModel();
const cartmodel = new cartModel();
const couponmodel=new couponModel();


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
	const coupons=await couponmodel.getAllCoupons();
	if (cartResult.cart) {
		cartResult.cart.items.forEach(async (item) => {
			const product = await productDatabase.find({ _id: item.product });
			if (product[0].stocks < item.quantity) {
				return res.redirect("/cart");
			}
		});
		const result = await ordermodel.getAddress(req.session.user._id, res);
	const userWallet=await ordermodel.getUserData(req.session.user._id);
		if (cartResult.status) {
			if (result.status) {
				 let discountAmount;
				 let couponcode;
				 if(req.session.coupon){
					const coupon=req.session.coupon;
					couponcode=coupon.code;
					discountAmount=(coupon.discount/100)*cartResult.cart.total;
				 }else{
					discountAmount=0;
					couponcode=null;
				 }
				let appliedWallet;
				if(req.session.appliedWallet){
					appliedWallet=req.session.appliedWallet
				}
				

				return res.render("user/checkout", {
					addresses: result.addresses,
					walletAmount:userWallet.amount,
					coupons:coupons,
					couponDiscount:discountAmount,
					couponcode:couponcode,
					appliedWallet:appliedWallet
					
				});
			} else {
				return res.render("user/checkout", {
					addresses: [],
					walletAmount:userWallet.amount,
					coupons:[],
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
	if (req.session.coupon) {
		let coupon = req.session.coupon;
		const discountAmount = (coupon.discount / 100) * cartTotal;
		cartTotal = cartTotal - discountAmount;
	  }

	  if (req.session.appliedWallet) {
		cartTotal = cartTotal - req.session.appliedWallet;
	  }

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
			
		}
			else if(paymentmethod==='razorpay'){
				const razorPayOrder= await Razorpay.generateRazorpay(checkoutResult.order);
				return res.json({
					success:true,
					paymethod:'ONLINE',
					message:'order details added!',
					order:razorPayOrder,
				});
			}
// else if(paymentmethod==='wallet'){
// 	if (res.session.userId >=cartTotal) {
// 		return res.json({
// 			success: true,
// 			paymethod: "wallet",
// 			message: "order details added!",
// 			orderId: checkoutResult.order._id
// 		});
// }
// }
	} else {
		return res.json({ success: false, message: "something goes wrong" });
	}
};


const VerifyPayment=async (req , res) =>{
	console.log(req.body)
	console.log('Hello it is verify payemnt data')
	const VerifyResult=await ordermodel.verifyPayment(req.body,res);
	console.log(VerifyResult)
	if(VerifyResult){
		let razorpay_payment_id = req.body['payment[razorpay_payment_id]'];
      let razorpay_order_id = req.body['payment[razorpay_order_id]'];
      let razorpay_signature = req.body['payment[razorpay_signature]'];
      let paymentDetails = { razorpay_payment_id, razorpay_order_id, razorpay_signature };
      const changePaymentResult = await ordermodel.changePaymentStatus(
        req.body['order[receipt]'],
        paymentDetails,
      );
	//   console.log("⚠️",razorpay_payment_id,razorpay_order_id, razorpay_signature, paymentDetails, changePaymentResult);
	  if(changePaymentResult){
		return res.json({success:true,message:'payment result updated'});
	  }else
	  {
		return res.json({
			success:false,
			message:'something gone wrong!payment result not updated',
		});

		}
	  
	}
}


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

	if(req.session.coupon){
		await ordermodel.addCouponData(req.session.coupon,req.session.user._id);
		delete req.session.coupon;
	}
	if (req.session.appliedWallet) {
		await ordermodel.updatedWalletData(req.session.appliedWallet, req.session.user._id, id);
		delete req.session.appliedWallet;
	  }

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


const changeOrderStatus=async (req,res)=>{
	console.log("✅");
	const { orderId,status }=req.body;
	const result =await ordermodel.changeOrderStatus(status,orderId);
	if(result.status){
		return res.json({ success: true, message: result.message });
    } else {
      return res.json({ success: false, message: result.message });
    }
	}

// function changeOrderStatus(orderId, status) {
//     fetch('/admin/order-status', {
//         method: 'post',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             orderId: orderId,
//             status: status
//         })
//     }).then(async (res) => {
//         if (res.ok) {
//             // If the response is successful, parse the JSON
//             const data = await res.json();
//             console.log(data);
//             // Handle the data as needed (reload the page, show a message, etc.)
//             location.reload();
//         } else {
//             // If the response is not successful (HTTP error), handle the HTML error
//             console.log(`HTTP error! Status: ${res.status}`);
//             // You may want to display an error message to the user or handle the error in some way
//         }
//     }).catch(err => {
//         console.log(err);
//         // Handle other errors, such as network issues
//     });
// }



const returnOrder= async(req,res)=>{
	try{
		const {id ,returnReason}=req.body;
		const cancelResult= await ordermodel.returnOrder(id,returnReason);
		if(cancelResult){
			res.json({message:'order return succesfully',success:true});
		}
		else{
			res.json({message:'something went wrong! return operation failed'});
		}
	}catch(error){
		handleError(res,error);
	}
}



const GetWallet = async (req, res) => {
    try {
        const transaction = await transactionDatabase.findOne({ user: req.session.user._id });
        const walletAmount = await ordermodel.getwallet(req.session.user._id);

        let templateData = {};

        if (walletAmount.status) {
            templateData = {
                walletAmount: walletAmount.amount,
                walletPending: walletAmount.pendingWallet,
            };
        } else {
            templateData = {
                walletAmount: walletAmount.amount,
                walletPending: walletAmount.pendingWallet,
            };
        }

        // Pass the transaction data if it exists
        templateData.transaction = transaction || {};

        return res.render('user/wallet', templateData);

    } catch (error) {
        handleError(res, error);
    }
};



const ApplyWallet=async (req,res)=>{
try {
	const userId=req.session.user._id;
	const walletAmount=req.body.walletInput;
	// const userId=req.session.user._id;
	const result=await cartmodel.cartProductTotal(userId);
	const response=await ordermodel.getUserData(userId);
	if(!result.status){
		return res.status(404).json({success:false,message:'something wrong! cart is not found'});
	}
	let cart=result.cart;
	let totalWallet=response.amount;
	let cartTotal=cart.total;
	let maxAmount;

	if(req.session.coupon){
		let coupon =req.session.coupon;
		const discountAmount=(coupon.discount/100)* cartTotal;
		cartTotal=cartTotal-discountAmount;
	}

	if(totalWallet>cartTotal){
		maxAmount=cartTotal;
	}else{
		maxAmount=totalWallet;
	}

	if(maxAmount<walletAmount){
		return res.status(400).json({success:false,message:'oops!wrong wallet amount'});	
	}

	cartTotal=cartTotal-walletAmount;
	let walletBalance=totalWallet-walletAmount;
	req.session.appliedWallet=walletAmount;


	// const debitedTransaction = await transactionDatabase.create({
	// 	user: userId,
	// 	amount: walletAmount,
	// 	type: "Debited",
	// 	orderId: response._id,
	// 	paymentMethod: "Wallet",
	// 	date: Date.now()
	// });
	// await UserModel.findByIdAndUpdate(userId, { walletBalance });


	const transaction = await transactionDatabase.findOne({ user: userId });
	if(transaction){
		transaction.amount = walletAmount
		transaction.type = "Debited"
		transaction.orderId = response._id
		transaction.paymentMethod = "Wallet"
		transaction.date = Date.now()
		await transaction.save()
	}else{
		await transactionDatabase.create({
			user: userId,
			amount: walletAmount,
			type: "Debited",
			orderId: response._id,
			paymentMethod: "Wallet",
			date : Date.now()
		});
		console.log("success 2");

	}

	return res.json({success:true,cartTotal,walletBalance});	
} catch (error) {	
	handleError(res,error);
}
}



const Failedpage=async(req,res)=>{
	if(req.session.coupon){
		delete req.session.coupon;
	}
	if(req.session.appliedWallet){
		delete req.session.ApplyWallet
	}
	res.render('user/failed-page');
}



const showTransactionHistory = async (req, res) => {
    try {
        const userId = req.session.userId; 
        const transactions = await transactionDatabase.find({ user: userId });

        if (transactions.length > 0) {
            res.status(200).json({ success: true, transactions });
        } else {
            res.status(404).json({ success: false, message: 'No transaction history found for the user' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};





module.exports = {
	getorderpage,
	GetCheckOut,
	PostCheckOut,
	AddAddress,
	SuccessPage,
	Failedpage,
	getOrderDetails,
	DeleteAddress,
	CancelOrder,
	changeOrderStatus,
	returnOrder,
	GetWallet,
	ApplyWallet,
	VerifyPayment,
	showTransactionHistory
}
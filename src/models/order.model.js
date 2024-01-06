const orderDatabase = require("../schema/order.schema");
const addressDatabase = require("../schema/address.schema");
const cartDatabase = require("../schema/cart.schema");
const productDatabase = require("../schema/product.schema");
const userDatabase = require("../schema/user.schema");
const { addressSchema } = require("../config/joi");
const crypto = require("crypto");
const moment = require("moment");

class orderModel {
	constructor() {}

	async getallorders(page, limit) {
		const orders = await orderDatabase
			.find()
			.sort({ date: -1 })
			.populate("user", "username")
			.skip((page - 1) * limit)
			.limit(limit);

		const totalOrders = await orderDatabase.countDocuments();
		const totalPages = Math.ceil(totalOrders / limit);
		if (!orders || orders.length === 0) {
			return {
				status: false,
				limit: limit,
				orders: [],
				totalPages: totalPages,
				currentPage: page,
				message: "Orders not found"
			};
		}
		return {
			status: true,
			limit: limit,
			orders: orders,
			totalPages: totalPages,
			currentPage: page,
			message: "Orders found successfully"
		};
	}

	async AddOrderDetails(addressId, paymentMethod, userId, req, res) {
		if (!["razorpay", "cashOnDelivery"].includes(paymentMethod)) {
			console.log("payment method:", paymentMethod);
			throw new Error("Invalid payment method");
		}
		//fetching the cart items and total
		const cartResult = await cartDatabase.findOne({ user: userId }).select("items total");
		if (cartResult) {
			//create transaction id
			const transactionId = crypto
				.createHash("sha256")
				.update(`${Date.now()}-${Math.floor(Math.random() * 12939)}`)
				.digest("hex")
				.substr(0, 16);

			const orderStatus = paymentMethod === "cashOnDelivery" ? "processing" : "pending";

			const order = new orderDatabase({
				user: userId,
				items: cartResult.items,
				shippingAddress: addressId,
				paymentmethod: paymentMethod,
				transactionId: transactionId,
				status: orderStatus,
				total: cartResult.total
			});

			// if (req.session.coupon) {
			//   let coupon = req.session.coupon;
			//   const discountAmount = (coupon.discount / 100) * cartResult.total;
			//   order.discount = discountAmount;
			//   order.total = cartResult.total - discountAmount.toFixed(2);
			// }

			// if (req.session.appliedWallet) {
			//   let appliedWallet = req.session.appliedWallet;
			//   order.total = order.total - appliedWallet;
			// }

			for (const item of cartResult.items) {
				const quantity = item.quantity;
				await productDatabase.findByIdAndUpdate(item.product, { $inc: { stocks: -quantity } }, { new: true });
			}
			await order.save();
			await cartDatabase.deleteOne({ user: userId });
			return { status: true, order: order, cartResult };
		} else {
			return { status: false };
		}
	}

	async verifyPayment(razorData, res) {
		let expectsignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
		expectsignature.update(razorData["payment[razorpay_order_id]"] + "|" + razorData["payment[razorpay_payment_id]"]);
		expectsignature = expectsignature.digest("hex");
		if (expectsignature === razorData["payment[razorpay_signature]"]) {
			return true;
		} else {
			return false;
		}
	}

	async AddAddress(addressData, userId, res) {
		console.log(addressData);
		const validation = addressSchema.validate(addressData, {
			abortEarly: false
		});

		if (validation.error) {
			return { status: false, message: validation.error.details[0].message };
		}

		// Validate input
		if (!addressData || !userId) {
			throw new Error("Missing required input");
		}
		const address = new addressDatabase({
			fname: addressData.fname,
			lname: addressData.lname,
			street_address: addressData.street_address,
			city: addressData.city,
			state: addressData.state,
			zipcode: addressData.zipcode,
			country: addressData.country,
			phone: addressData.phone,
			email: addressData.email,
			user: userId,
			isShippingAddress: true
		});
		const addressResult = await address.save();
		if (addressResult) {
			return { status: true, message: "address added to the database" };
		} else {
			return { status: false, message: "something wrong! address not added" };
		}
	}

	async getAddress(userId) {
		const addresses = await addressDatabase.find({ user: userId });

		if (!addresses) {
			return { status: false };
		} else {
			return { status: true, addresses: addresses };
		}
	}

	async setSuccessStatus(orderId) {
		const result = await orderDatabase.updateOne(
			{ _id: orderId },
			{
				$set: {
					paymentStatus: "success"
				}
			}
		);

		if (result) {
			return true;
		}
	}

	async OrderDetails(orderId) {
		const orderData = await orderDatabase
			.findById(orderId)
			.populate({
				path: "items.product",
				select: "productName productPrice productimageurl",
				model: "Product"
			})
			.populate({
				path: "user",
				select: "username email",
				model: "user"
			})
			.populate("shippingAddress");

		const subtotal = orderData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
		orderData.subtotal = subtotal;

		if (orderData) {
			console.log(orderData);
			return { status: true, orderData };
		} else {
			return { status: false };
		}
	}

	async deleteAddress(addressId) {
		const result = await addressDatabase.findByIdAndDelete(addressId);
		if (result) {
			return true;
		} else {
			return false;
		}
	}

	async fetchorderuserdetails(userId, page, limit) {
		const orders = await orderDatabase
			.find({ user: userId })
			// .skip((page - 1) * limit)
			// .limit(limit)
			.select("total status transactionId date items paymentStatus")
			.sort({ date: -1 });

		const totalOrder = await orderDatabase.countDocuments();
		const totalPages = Math.ceil(totalOrder / limit);
		const addresses = await addressDatabase.find({ user: userId });
		const orderDetails = orders.map((order) => {
			// Calculate the return date
			const returnDate = new Date(order.date);
			returnDate.setDate(returnDate.getDate() + 7);

			return {
				productCount: order.items.length,
				date: order.date.toLocaleDateString("en-US", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				}),
				returnDate: returnDate.toLocaleDateString("en-US", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				}),
				transactionId: order.transactionId,
				total: order.total,
				status: order.status,
				paymentStatus: order.paymentStatus,
				id: order._id
			};
		});

		return {
			orderDetails: orderDetails,
			addresses: addresses,
			totalPages: totalPages,
			currentPage: page,
			limit: limit
		};
	}

	async cancelorder(orderId, cancelreason) {
		const result = await orderDatabase.updateOne(
			{ _id: orderId },
			{
				$set: {
					status: "cancelPending",
					cancel_reason: cancelreason
				}
			}
		);
		return result.modifiedCount === 1;
	}

	async getorderData() {
		const orders = await orderDatabase
			.find({ status: "delivered" })
			.populate({
				path: "items.product",
				model: "Product"
			})
			.populate("shippingAddress")
			.populate("user");
		console.log(orders);
		let reportData = [];

		for (const order of orders) {
			for (const item of order.items) {
				const { product, quantity, price } = item;

				const entry = {
					date: order.date,
					product: product.productName,
					quantity,
					price
				};

				reportData.push(entry);
			}
		}
		console.log(reportData);
		return reportData;
	}

	async getOrders(startDate, endDate) {
		let query = { status: "delivered" };
		if (startDate && endDate) {
			query.date = { $gte: startDate, $lte: endDate };
		}
		const orders = await orderDatabase
			.find(query)
			.populate({
				path: "items.product",
				model: "Product"
			})
			.populate("shippingAddress")
			.populate("user");

		const reportData = [];

		for (const order of orders) {
			for (const item of order.items) {
				const { product, quantity, price } = item;

				const entry = {
					date: order.date,
					product: product.productName,
					quantity,
					price
				};

				reportData.push(entry);
			}
		}

		return reportData;
		// Calculate daily, weekly, and monthly aggregates

		// const dailyAggregates = groupOrdersBy(reportData, 'day');
		// const weeklyAggregates = groupOrdersBy(reportData, 'week');
		// const monthlyAggregates = groupOrdersBy(reportData, 'month');
		// return {
		//     reportData,
		//     dailyAggregates,
		//     weeklyAggregates,
		//     monthlyAggregates
		// };
	}

	// Helper function to group orders by day, week, or month
	async groupOrdersBy(orders, interval) {
		const groupedOrders = {};

		for (const entry of orders) {
			const formattedDate = moment(entry.date).startOf(interval).format("YYYY-MM-DD");

			if (!groupedOrders[formattedDate]) {
				groupedOrders[formattedDate] = {
					totalQuantity: 0,
					totalPrice: 0
				};
			}

			groupedOrders[formattedDate].totalQuantity += entry.quantity;
			groupedOrders[formattedDate].totalPrice += entry.quantity * entry.price;
		}
		return groupedOrders;
	}

	async changeOrderStatus(changeStatus, orderId) {
		if (!["shipped", "delivered", "canceled", "returned"].includes(changeStatus)) {
			throw new Error("Invalid status");
		}
		const orderResult = await orderDatabase.findByIdAndUpdate(orderId, {
			$set: {
				status: changeStatus
			}
		});
		if (orderResult) {
			return { status: true, message: "order updated" };
		} else {
			return { status: false, message: "something goes wrong updation failed" };
		}
	}

	async returnOrder(orderId, returnReason) {
		try {
			const result = await orderDatabase.updateOne(
				{ _id: orderId },
				{
					$set: {
						status: "returnPending",
						retrun_reason: returnReason
					}
				}
			);
			return result?.modifiedCount === 1;
		} catch (error) {
			console.log(error);
		}
	}

	async getwallet(userId) {
		try {
			const amount = await userDatabase.findById(userId).select("wallet");
			const pendingOrders = await orderDatabase
				.find({
					user: userId,
					status: "returnPending"
				})
				.select("total");

			let pendingAmount = 0;

			for (let order of pendingOrders) {
				await new Promise((resolve) => setTimeout(resolve, 0));
				pendingAmount += order.total;
			}

			if (amount) {
				return { status: true, amount: amount.wallet, pendingWallet: pendingAmount };
			} else {
				return { status: false, amount: 0, pendingWallet: pendingAmount };
			}
		} catch (error) {
			console.error("error while fetching the wallet:", error);
			throw new Error("Oops!something went wrong while fetching wallet");
		}
	}

	async getUserData(userId) {
		try {
			const amount = await userDatabase.findById(userId).select("wallet");
			if (amount) {
				return { status: true, amount: amount.wallet };
			} else {
				return { status: false, amount: 0 };
			}
		} catch (error) {
			throw new Error("error in finding user!");
		}
	}

	async changePaymentStatus(orderId,paymentDetails,res){
		try {
			const changePaymentStatus=await orderDatabase.updateOne({_id:orderId},
				{
				$set:{
					status:'processing',
					paymentResponse:paymentDetails
				}
			})
			return (changePaymentStatus.modifiedCount>0)? true: false;
				
		} catch (error) {
			throw new Error("Error in changing payment status")
		}
	}
}

module.exports = orderModel;

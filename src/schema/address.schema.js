const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
	fname: {
		type: String,
		required: true
	},
	lname: {
		type: String,
		required: true
	},
	country: {
		type: String,
		require: true
	},
	city: {
		type: String,
		require: true
	},
	street_address: {
		type: String,
		required: true
	},
	state: {
		type: String,
		required: true
	},
	zipcode: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
	},
	isShippingAddress: {
		type: Boolean,
		default: false,
	  },
	  isBillingAddress: {
		type: Boolean,
		default: false,
	  },
});
module.exports = mongoose.model("address", addressSchema);

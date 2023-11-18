const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: true
	},
	lastname: {
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
	street: {
		type: String,
		required: true
	},
	state: {
		type: String,
		required: true
	},
	pincode: {
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
	}
});
module.exports = mongoose.model("address", addressSchema);

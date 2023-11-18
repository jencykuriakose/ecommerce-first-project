const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	phone: {
		type: Number,
		required: true,
		unique:true
	},
	profileimage: {
		type: String
	},
	address: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "address"
	}
});

module.exports = mongoose.model("user", userSchema);

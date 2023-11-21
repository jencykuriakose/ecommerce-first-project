const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	isadmin: {
		type: Boolean,
		default: false
	},
	password: {
		type: String,
		required: true
	},
	phone: {
		type: Number,
		required: true,
		unique: true
	},
	profileimage: {
		type: String
	},
	address: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "address"
	}
});

userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	const genSalt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, genSalt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	const isMatch = await bcrypt.compare(candidatePassword, this.password);
	return isMatch;
};

module.exports = mongoose.model("user", userSchema);

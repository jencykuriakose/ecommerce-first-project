const mongoose = require("mongoose");

const catergorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	discount:{
		type : Number 
	},
	active: {
		type: Boolean,
		required: true
	}
});

module.exports = mongoose.model("Category", catergorySchema);

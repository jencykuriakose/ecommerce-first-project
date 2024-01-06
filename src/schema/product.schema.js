const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
	{
		productName: {
			type: String,
			required: true
		},

		productDescription: {
			type: String,
			required: true
		},

		productCategory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true
		},

		productPrice: {
			type: Number,
			required: true
		},

		productoldprice: {
			type: Number,
			default: true
		},

		stocks: {
			type: Number,
			required: true
		},

		productimageurl: [
			{
				type: String
			}
		],

		deleteStatus: {
			type: Boolean,
			default: false
		},

		productnumber: {
			type: Number
		},
		productstatus: {
			type: Boolean,
			default: true
		},
		featured: {
			type: Boolean,
			default: false,
		  },
		// slug: {
		// 	type: String
		// }
	},

	{ timestamps: true }
);



module.exports = mongoose.model("Product", ProductSchema);

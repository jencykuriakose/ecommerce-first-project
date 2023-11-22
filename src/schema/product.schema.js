const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
	{
		productname: {
			type: String,
			required: true,
			unique: true
		},

		productDescription: {
			type: String,
			required: true
		},

		productCategory: {
			type: mongoose.Schema.Types.Objectid,
			ref: "category",
			required: true
		},

		productprice: {
			type: Number,
			required: true
		},

		productoldprice: {
			type: Number,
			default: null
		},

		stocks: {
			type: Number,
			required: true
		},

		prodcutimageurl: [
			{
				type: String
			}
		],

		productstatus: {
			type: Boolean,
			default: true
		},

		productnumber: {
			type: Number
		},

		slug: {
			type: String
		}
	},

	{ timestamps: true }
);

// const autoincrementplugin=(schema,Options)=>{
//     const {field="productnumber",startAt=1}=options;

//     schema.pre("save",async function(next){
//         if(!this[field]){
//             const lastorder=await this.constructor.findone
//         }
//     })
// }

module.exports = mongoose.model("product", ProductSchema);

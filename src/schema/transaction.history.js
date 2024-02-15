// const { string } = require("joi");
// const mongoose=require("mongoose");

// const transactionSchema= new mongoose.Schema({
//     user:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"user"
//     },
//     amount:Number,
//     type:string,
//     orderId:String,
//     paymentMethod:String,
//     date:{
//     type:Date,
//     default:Date.now
//     },
//     description:String
// });
// module.exports=mongoose.model('Transaction',transactionSchema);

// const { String } = require("../config/joi");

const { array } = require("joi");
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
	},
	amount: Number,
	type: String,
	orderId: String,
	paymentMethod: String,
	date: {
		type: Date
	}
});

module.exports = mongoose.model("Transaction", transactionSchema);

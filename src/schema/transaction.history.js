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

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    amount: Number,
    type: String,  // Use uppercase "String" here
    orderId: String,
    paymentMethod: String,
    date: {
        type: Date,
        // default: Date.now
    },
    description: String
});

module.exports = mongoose.model('Transaction', transactionSchema);

const { boolean } = require("joi");
const mongoose=require("mongoose");

const wishlistSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true,
            }, 
        },
    ],
    total:{
        type:Number,
        default:0,
    },
    status:{
        type:Boolean,
        default:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});

module.exports=mongoose.model('wishlist',wishlistSchema);


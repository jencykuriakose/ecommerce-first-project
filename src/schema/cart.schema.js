const { boolean } = require('joi')
const mongoose=require('mongoose')


const cartschema=new mongoose.Schema({
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
            quantity:{
                type:Number,
                required:true,
            },
            price:{
                type:Number,
                required:true
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
    createAt:{
        type:Date,
        default:Date.now
    },
});
module.exports=mongoose.model('Cart',cartschema);


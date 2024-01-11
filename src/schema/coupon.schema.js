 const { string } = require("joi");
//  const { Number } = require("twilio/lib/twiml/VoiceResponse");
const mongoose = require('mongoose');

const couponSchema=new mongoose.Schema({
    couponname:{
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true,
        unique:true,
    },
    discount:{
        type:Number,
        required:true,
        min:0,
    },
    couponDescription:{
        type:String,
        required:true,
    },
    minimumPurchase:{
        type:Number,
        required:true,
    },
    validUntil:{
        type:Date,
        required:true,
    },
    validFrom: {
        type: Date,
        required: true,
    },
    isActive:{
        type:Boolean,
        required:true, 
    },
});
    couponSchema.pre('save',function(next){
        const currentDate=new Date();
        if(this.validUntil<currentDate){
            this.isActive=false;
        }
        next();   
});

module.exports = mongoose.model("Coupon", couponSchema);
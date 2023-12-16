const { boolean, number } = require('joi');
const mongoose=require('mongoose');

const orderschema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'product',
                required:true, 
            },
            price:{
                type: Number,
                required: true,
            },
            quantity:{
              type:Number,
              required:true
            }
        },
    ],
    paymentmethod: {
        type: String,
        required: true,
      },
      shippingAddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'address',
        required:true,
      },
      transactionId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: [
          'pending',
          'processing',
          'shipped',
          'delivered',
          'canceled',
          'cancelPending',
          'returnPending',
          'returned',
        ],
        default: 'pending',
      },
      paymentResponse: [],
      total: {
        type: Number,
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ['failed', 'success'],
        default: 'failed',
      },
      cancel_reason: {
        type: String,
      },
      return_reason: {
        type: String,
      },
      discount:{
        type: Number,
        default:0,
      },
      wallet:{
        type: Number,
        default:0,
      },
      orderNumber: { type: Number },
      date: {
        type: Date,
        default: Date.now,
      },
});
 const autoIncrementPlugin = (schema, options) => {
   const { field = 'orderNumber', startAt = 1 } = options;

  schema.pre('save', async function (next) {
    try {
      if (!this[field]) {
        const lastOrder = await this.constructor.findOne({}, field).sort({ [field]: -1 }).exec();
        const newOrderNumber = lastOrder ? lastOrder[field] + 1 : startAt;
        this[field] = newOrderNumber;
      }
      next();
    } catch (error) {
      next(error);
    }
  });
};

orderschema.plugin(autoIncrementPlugin, { field: 'orderNumber', startAt: 1000 });


module.exports=mongoose.model('Orders',orderschema);
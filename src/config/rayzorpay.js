const Razorpay = require('razorpay');
// require('dotenv').config();
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function generateRazorpay(orders) {
  var options = {
    amount: orders.total * 100, // amount in the smallest currency unit
    currency: 'INR',
    receipt: String(orders._id),
  };
  
  try {
    const order = await new Promise((resolve, reject) => {
      instance.orders.create(options, function (err, order) {
        if (err) {
          reject(new Error('something goes wrong! while razorpay payment!'+err));
        } else {
          resolve(order);
        }
      });
    });
    
    console.log(order);
    return order;
    
  } catch (error) {
    throw error;
  }
}



module.exports = { generateRazorpay };

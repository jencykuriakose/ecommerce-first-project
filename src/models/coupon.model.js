
const couponDatabase=require("../schema/coupon.schema");
const userDatabase=require("../schema/user.schema");
const cartDatabase=require("../schema/cart.schema")


class couponModel{
    constructor(){}



    async getAllCoupons(){
        try{
const currentDate=new Date();
const result=await couponDatabase.find({ValidUntil:{$gte:currentDate}}).sort({validForm: 1});
return result;
        }catch(error){
throw new Error('oops!something wrong while fetching coupon');
        }
    }

    async isUserValidForCoupon(userId,coupon){
        // try {
            const user = await userDatabase.findById(userId);
            if (user.couponHistory.length > 0) {
              const usedCoupon = user.couponHistory.find(couponId => couponId.equals(coupon._id));
              if (usedCoupon) {
                return { status: false, message: 'Coupon already used' };
              }
            }
        
            const cart = await cartDatabase.findOne({ user: userId });
            if (cart.total < coupon.minimumPurchase) {
              return {
                status: false,
                message: 'Cart total does not meet the minimum purchase requirement',
              };
            }
           
            let cartTotal = cart.total;
            return { status: true,cartTotal};
          // } catch (error) {
          //   throw new Error('oops!something wrong while checking user is valid for coupon');
          // }
    }

    async findcoupon(couponName){
    try{
        const result = await couponDatabase.findOne({ code: couponName });
    if (result) {
      return { status: true, coupon: result };
    } else {
      return { status: false };
    }
  } catch (error) {
    throw new Error('oops!something wrong while fetching coupons');
    }
}


async changecouponstatus(couponId,updateStatus){
try{
  const result=await couponDatabase.updateOne(
    {_id:couponId},
    {$set: {isActive:updateStatus} },
  );
  if(result.modifiedCount>0){
    return {status:true};
  }else{
    return {status:false};
  }
}catch(error){
throw new error('oops! something wrong while fetching coupons')
}
}




async addCoupon(dataBody){
  // try {
    console.log(dataBody);
    const { couponname, couponDescription, discount, validFrom, validUntil, minimumPurchase } = dataBody;
    const randomThreeDigitNumber = Math.floor(100 + Math.random() * 900);
    const code = `${couponname.split(' ').join('')}${randomThreeDigitNumber}`.toUpperCase();
     

    const coupon = new couponDatabase({
      couponname: couponname,
      code:code,
      couponDescription: couponDescription,
      minimumPurchase: minimumPurchase,
      discount: discount,
      validFrom: validFrom,
      validUntil: validUntil,
      isActive: true
    });
    const result = await coupon.save();
    if (result) {
      console.log(result);
      return true;
      
    } else {
      return false;
    }
  // } catch (error) {
  //   throw new Error('oops!something wrong while adding coupon');
  // }
}
                                                                                    




async  getAllCoupons() {
  try {
    const result = await couponDatabase.find({}).sort({ validFrom: 1 });
    return result;
  } catch (error) {
    throw new Error('oops!something wrong while fetching coupons');
  }
}









}
module.exports=couponModel;


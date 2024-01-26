const { handleError } = require("../middleware/error-handler.middleware");
const couponModel=require("../models/coupon.model");
 const { validate } = require("../schema/coupon.schema");
const { CouponValidationSchema }=require("../config/joi");

 const couponmodel=new couponModel();

const GetCoupon=async(req,res)=>{
try{
    const coupons=await couponmodel.getAllCoupons();
    res.render('admin/coupons', { activepage :'coupons', coupons });
}catch(error){
handleError(res,error);
}
}


const ApplyCoupon=async(req,res)=>{
 try{
  const { couponName } = req.body;
    const coupon = await couponmodel.findcoupon(couponName);
    if (!coupon.status) {
      return res.json({ success: false, message: 'Invalid coupon' });
    }
    
    if (coupon.coupon.expiryDate < new Date()) {
      return res.json({ success: false, message: 'Coupon has expired' });
    }
    // const userId = req.session.userId;
    const userId=req.session.user._id;
    const response = await couponmodel.isUserValidForCoupon(userId, coupon.coupon);
    if (response.status) {

      if (req.session.appliedWallet) {
         if(response.cartTotal - req.session.appliedWallet<1){
          return res.json({
            success: false,
            cartTotal: 0,
            message: 'Cant apply discount amount!',
          });
         }
      }

      const discountAmount = (coupon.coupon.discount / 100) * response.cartTotal;
      let cartTotal = response.cartTotal - discountAmount;
    
       
      req.session.coupon = coupon.coupon;


      if (req.session.appliedWallet) {
        if(cartTotal<req.session.appliedWallet){
         const wallet =  req.session.appliedWallet - cartTotal
          return res.json({
            success: false,
            message: `You can only add wallet amount ${wallet} while using coupon!`,
          });
        }
        const discountAmount=(coupon.coupon.discount/100)* response.cartTotal;
        let cartTotal=response.cartTotal-discountAmount;

        req.session.coupon=coupon.coupon;

        if(req.session.appliedWallet){
          if(cartTotal<req.session.appliedWallet){
            const wallet=req.session.appliedWallet-cartTotal
            return res.json({
              success:false,
              message:`You can only add wallet amount ${wallet} while using coupon!`,
            });
          }
        }

        cartTotal = cartTotal - req.session.appliedWallet;
      }

      return res.json({
        success: true,
        cartTotal: cartTotal,
        discount: discountAmount,
        message: 'Coupon successfully added',
      });
    } else {
      return res.json({ success: false, message: response.message });
    }
  } catch (error) {
    handleError(res, error);
  }
}



const ChangeCouponStatus=async(req,res)=>{
  try{
const {id,status}=req.body;
const result=await couponmodel.changecouponstatus(id,status);
if(result.status){
res.status(200).json({status:true});
}else{
res.status(500).json({status:false});
}
  }catch(error){
handleError(res,error);
  }
}




const RemoveCoupon=async(req,res)=>{
    try{
        if(req.session.coupon){
req.session.coupon=null;
return res.json({ status: true, message: 'coupon removed succesfully' });
    }
    return res.json({ status: false, message: 'something wrong!cant remove coupon!' });
        }catch(error){
        
        }
    
    }

    const AddCoupon=async(req,res)=>{
      try{
    const validation = CouponValidationSchema.validate(req.body, { abortEarly: false });

if(validation.error){
  return  res.status(400).json({success:false,message:validation.error.details[0].message});
}
const result= await couponmodel.addCoupon(req.body);
if(result){
  return res.status(200).json({success:true,message:'coupon added successfully'});
}else{
  return res.status(400).json({success:false,message:'oops! something wrong internal server error'});
}
      }catch(error){
handleError(res,error);
      }
    }








module.exports = {
    GetCoupon,
    ApplyCoupon,
    RemoveCoupon,
    ChangeCouponStatus,
    AddCoupon
    
    
};
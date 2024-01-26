const productSchema = require("../schema/product.schema");
const CartModel = require("../models/cart.model");
const { handleError } = require("../middleware/error-handler.middleware");

const cartmodel = new CartModel();

const GetCart = async (req, res) => {
	if (req.session.user) {
		const userId = req.session.user._id;
		const cartResult = await cartmodel.fetchCartProducts(userId);
		console.log(userId);
		console.log(cartResult);
		if (cartResult.status) {
			const items = cartResult.cart.items.map((item) => ({
				product: item.product,
				quantity: item.quantity,
				price: item.price
			}));
			// console.log(items, cartResult.total);
			return res.render("user/cart", { items, total: cartResult.total });
		}
	} else {
		return res.render("user/cart", { items: [], total: 0 });
	}
};

const PostToCart = async (req, res) => {
	const { productId, quantity } = req.body;

	const userId = req.session.user;

	if (!productId || typeof productId !== "string") {
		return res.status(400).json({ success: false, message: "Invalid product id" });
	}

	if (!quantity || typeof quantity !== "number" || quantity <= 0) {
		return res.status(400).json({ success: false, message: "Invalid quantity" });
	}

	const cartResult = await cartmodel.addItemToCart(userId, productId, quantity);
	if (cartResult.status) {
		res.status(200).json({ success: cartResult.status, message: cartResult.message, product: cartResult.productData });
	} else {
		res.status(404).json({ success: cartResult.status, message: cartResult.message, product: [] });
	}
};

const RemoveFromCart=async (req,res)=>{
	const {productId}=req.body;
	const userId=req.session.user._id;
	if(!productId || typeof productId!=='string'){
		return res.status(400).json({status:false,message:'invalid product id '});
	}
	const cartResult=await  cartmodel.RemoveItemFromCart(userId,productId);
	if(cartResult.status){
		res.status(200).json({ status: cartResult.status, message: cartResult.message ,total:cartResult.total });
    } else {
      res.status(404).json({ status: cartResult.status, message: cartResult.message });
    }
	
};

const ClearCart=async(req, res)=>{
	
	  const cartResult = await cartmodel.ClearCartItems(req.session.user._id);

	  if (cartResult.status) {

		return res.json({ success: true, message: cartResult.message });

	  } else {

		return res.json({ success: false, message: cartResult.message });

	  }

	} 
  
const UpdateQuantity=async(req,res)=>{


const {quantity,productId}=req.body;
const userId=req.session.user._id;
const cartResult = await cartmodel.updateCartDetails(quantity, productId, userId);

    if (cartResult.status) {
      return res.json({
        success: true,
        message: cartResult.message,
        total: cartResult.total,
      });
    } else {
      return res.json({ success: false, message: cartResult.message });
    }
  } 


  const getWishlist=async (req,res)=>{
	// try{
	const userId=req.session.user._id;
	const wishlistresult= await cartmodel.fetchWishlistProducts(userId);
	if(wishlistresult.status){
		const items = wishlistresult.wishlist.items.map((item) => ({
			product:item.product,
			quantity:item.quantity,
			price:item.price,
		}));
		return res.render('user/wishlist',{items} )	
	}
	return res.render('user/wishlist',{items: [] })

// }catch(error){
// handleError(res,error)
// }
  }



  const postWishlist=async(req,res)=>{
	const  {productId}=req.body;
	const userId=req.session.user._id;
	if (!productId || typeof productId !== 'string') {
		return res
		  .status(400)
		  .json({ success: false, message: 'Invalid product id' });
	  }
	  const wishlistItem = await cartmodel.addItemToWishlist(userId, productId);
	  if (wishlistItem.status) {
		res
		.status(200)
		.json({ success: wishlistItem.status, message: wishlistItem.message, product: wishlistItem.productData ,productAlreadyExist:wishlistItem.productAlreadyExist});
	  } else {
		res
		  .status(404)
		  .json({ success: wishlistItem.status, message: wishlistItem.message, product: [] });
	  }
  }

const RemoveFromWishlist=async(req,res)=>{
	const {productId}= req.body;
	const userId=req.session.user._id;
	if(!productId || typeof productId !=='string'){
		return res.status(400).json({status:false,message:'invalid product id' });
	}
	const wishlistResult= await cartmodel.RemoveItemFromWishlist(userId,productId);
	if(wishlistResult.status){
		res.status(200).json({status:wishlistResult.status,message:wishlistResult.message});
	}
	else{
		res.status(400).json({status:wishlistResult.status,message:wishlistResult.message});
	}

	
}






module.exports = {
	GetCart,
	PostToCart,
	RemoveFromCart,
	ClearCart,
	UpdateQuantity,
	getWishlist,
	postWishlist,
	RemoveFromWishlist,
	
};

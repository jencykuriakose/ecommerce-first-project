
const productDatabase=require('../schema/product.schema');
const userDatabase=require('../schema/user.schema');
const cartDatabase=require('../schema/cart.schema');
const wishlistDatabase=require('../schema/wishlist.schema');


class cartModel {
    constructor() {}


    async addItemToCart (userId,productId,quantity){
            const product= await productDatabase.findById(productId)
            .select('productPrice productimageurl productName _id stocks');

            if(!product){
                return {status:false,message:'product is not found'};
            }
            let cart=await cartDatabase.findOne({user:userId});

            if(cart){
                // If cart already exists, check if the product is already in the cart

      const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));
      if (itemIndex > -1) {

        // If product already in cart, update its quantity and price

        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].price = product.productPrice;
            }
            else{
                cart.items.push({
                product:productId,
                quantity:quantity,
                price:product.productPrice,
                });
            }
            cart.total=cart.items.reduce((acc,item)=>acc+item.price * item.quantity,0);
            await cart.save();
            return{
                status:true,
                message:'product added to cart',
                productData:product,
            };
        
    }

    //if the cart is doesnot exist,create a cart and add product 

    const NewCart=await cartDatabase.create({
        user:userId,
        items:[
            {
                product:productId,
                quantity:quantity,
                price:product.productPrice
            },
        ],
        total:product.productPrice,
    });
    await userDatabase.findByIdAndUpdate(userId, { cart: NewCart._id });
    return {
      status: true,
      message: 'product added to cart',
      productData: product,
    };
 
}


async fetchCartProducts(userId){
  console.log('request');
  
    const cart=await cartDatabase.findOne({user:userId}).populate('items.product');
    if(!cart){
        return {status:false, cart ,total :0 };
    }
    else{
        const total=cart.items.reduce((acc,item)=>{
            return acc+item.quantity*item.price;
        },0);
        return {status:true,cart,total};
    }
}


async RemoveItemFromCart(userId,productId){

    const product=await productDatabase.findById(productId).select('ProductPrice');

    if(!product){

        return {status:false,message:'product not found'}

    }

    let cart = await cartDatabase.findOne({ user: userId });

    if (cart) {

      // If cart already exists, check if the product is in the cart

      const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));

      if (itemIndex > -1) {

        // If product is in cart, remove it

        cart.items.splice(itemIndex, 1);

        cart.total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        await cart.save();

        return {

          status: true,

          message: 'product removed from cart',

          total: cart.total,

        };
      } else {

        return { status: false, message: 'product not found in cart'};

      }

    } else {

      return { status: false, message: 'cart not found' };
    }
  }
  
   async ClearCartItems(userId){
    const cart=await cartDatabase.findOne({user:userId});
    if(!cart){
        return {status:false,message:'cart not found'};
    }
    else{
        cart.items = [];
      cart.total = 0;
      await cart.save();
      return { status: true, message: 'Cart cleared successfully' };
    }
   }

   async  cartProductTotal(userId) {
   
      const cart = await cartDatabase.findOne({ user: userId });
      if (cart && cart.total > 0) {
        return {status: true, cart};
      } else {
        return {status: false};
      }
    }

    async updateCartDetails(quantity,productId,userId){
      const cart = await cartDatabase.findOne({ user: userId });
    if (cart) {
      const item = cart.items.find((item) => item.product.equals(productId));

      item.quantity = quantity;

      cart.total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

      await cart.save();

      return {
        status: true,
        message: 'cart updated!',
        total: cart.total,
      };
    } else {
      return { status: false, message: 'cart not found!' };
    }
  } 
  

async fetchCartProducts(userId){
  const cart=await cartDatabase.findOne({user:userId}).populate('items.product');
  if(!cart){
    return { status: false, cart, total: 0 };
    } else {
      const total = cart.items.reduce((acc, item) => {
        return acc + item.quantity * item.price;
      }, 0);
      return { status: true, cart, total };
    }
  }



async addItemToWishlist(userId,productId){

  const product = await productDatabase
 
  .findById(productId)
  .select('productPrice productimageurl productName _id stocks');
if (!product) {

  return { status: false, message: 'product not found' };
}

let wishlist = await wishlistDatabase.findOne({ user: userId });
let productAlreadyExist = false;
if (wishlist) {
  const itemIndex = wishlist.items.findIndex((item) => item.product.equals(productId));
  if (itemIndex >= 0) {
    productAlreadyExist = true;
    return {
      status: false,
      message: 'product already exists!',
      productData: product, productAlreadyExist
    }
  } else {
    wishlist.items.push({
      product: productId,
      price: product.productPrice,
    });
    await wishlist.save();
    return {
      status: true,
      message: 'product added to cart',
      productData: product, productAlreadyExist
    }
  }
} else {
  const newWishlist = await wishlistDatabase.create({
    user: userId,
    items: [
      {
        product: productId,
        price: product.productPrice,
      }
    ]
  })
  await userDatabase.findByIdAndUpdate(userId, { wishlist: newWishlist._id });
  return {
    status: true,
    message: 'product added to cart',
    productData: product,
  };
}
}

async RemoveItemFromWishlist(userId,productId){
  const product=await productDatabase.findById(productId).select('productprice');
  if(!product){
    return {status:false,message:'product not found'};
  }
  let wishlist = await wishlistDatabase.findOne({ user: userId });
     const itemIndex = wishlist.items.findIndex((item) => item.product.equals(productId));
    if (itemIndex > -1) {
      wishlist.items.splice(itemIndex, 1);
      await wishlist.save();
      return {
        status: true,
        message: 'product removed from Wishlist',
      };
    } else {
      return { status: false, message: 'product not found in wishlist' };
    }

  } catch (error) {
    throw new Error('Something went wrong while removing product from cart');
  }





} 
  module.exports=cartModel;
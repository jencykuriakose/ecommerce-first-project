  
  const {handleError}=require('./error-handler.middleware')
  // const fetchCartProducts=require("../models/cart.model")
  const cartModel=require('../models/cart.model')
  
  const cartmodel=new cartModel()
  async function cartProducts(req, res, next) {
    try {
      if (req.session.user) {
        const cartResult = await cartmodel.fetchCartProducts(req.session.user._id);
        res.locals.cart = cartResult.cart;
      }
      next();
    } catch (error) {
       handleError(res, error);
    }
  }

  async function loggedInMiddleware(req, res, next) {
    try {
      if (req.session.user) {
        res.locals.user = req.session.user;
      }
      next();
    } catch (error) {
      handleError(res, error);
    }
  }
  module.exports={
    cartProducts,
    loggedInMiddleware
  }
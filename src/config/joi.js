const Joi = require("joi");
const joi = require("joi");

const signupvalidationSchema = joi.object({
	username: joi.string().required(),
	email: joi.string().email().required(),
	phone: joi.string().length(10).required(),
	password: joi.string().required(),
	confirmpassword: joi.string().required(),
	otp: joi.string().required(),
	checkbox: joi.optional()
});

//add-product

const addProductSchema = joi.object({
	productName: joi.string().trim().min(2).max(100).required().messages({
		"string.base": "Product title must be a string",
		"string.empty": "Product title is required",
		"string.min": "Product title must be at least 2 characters long",
		"string.max": "Product title cannot exceed 100 characters"
	}),
	productDescription: joi.string().trim().min(5).max(600).required().messages({
		"string.base": "description must be a string",
		"string.empty": "description is required",
		"string.min": "description must be at least 5 characters long",
		"string.max": "description cannot exceed 600 characters"
	}),
	productPrice: joi.number().positive().required().messages({
		"number.base": "Regular price must be a number",
		"number.positive": "Regular price must be a positive number",
		"any.required": "Regular price is required"
	}),
	productOldPrice: joi.number().positive().required().messages({
		"number.base": "Old price must be a number",
		"number.positive": "Old price must be a positive number",
		"any.required": "Old price is required"
	}),
	stocks: joi.number().integer().positive().required().messages({
		"number.base": "Stocks must be a number",
		"number.integer": "Stocks must be an integer",
		"number.positive": "Stocks must be a positive number",
		"any.required": "Stocks is required"
	}),
	productCategory: joi.string().required().messages({
		"any.required": "Category is required"
	}),
	productImage: joi.array().required().messages({
		"any.required": "Product image is required"
	})
});

//update product

const updateproductschema = joi.object({
	productName: joi.string().trim().min(2).max(100).messages({
		"string.base": "product title must be string",
		"string.empty": "product title is required",
		"string.min": "product title must 2 characters long",
		"string.max": "product title cannot exceed 100 characters"
	}),
	productDescription: joi.string().trim().min(5).max(200).messages({
		"string.base": "product title must be string",
		"string.empty": "product title is required",
		"string.min": "product title must 5 characters long",
		"string.max": "product title cannot exceed 200 characters"
	}),
	productPrice: joi.number().positive().messages({
		"number.base": "regular price be a number",
		"number.positive": "regular price must be positive"
	}),
	productOldPrice: joi.number().positive().messages({
		"number.base": "old price be a number",
		"number.positive": "old price must be positive"
	}),

	stocks: joi.number().integer().min(0).messages({
		"number.base": "stock must be a number",
		"number.integer": "stock must be a integer",
		"number.min": "stock cannot be negative"
	}),
	productCategory: joi.string().required().messages({
		"any.required": "category is required"
	}),

	productimage: joi.array().messages({
		"any.required": "product image is required"
	}),
	productId:joi.string().required()
}).min(1);

//address
const addressSchema = joi.object({
	fname: joi
		.string()
		.trim()
		.pattern(/^[A-Za-z]+(?:[\s-][A-Za-z]+)*$/)
		.required(),
	lname: joi
		.string()
		.trim()
		.pattern(/^[A-Za-z]+(?:[\s-][A-Za-z]+)*$/)
		.required(),
	country: joi.string().trim().required(),
	street_address: joi.string().trim().required(),
	city: joi.string().trim().required(),
	state: joi.string().trim().required(),
	zipcode: joi.string().trim().pattern(/^\d+$/).required(),
	phone: joi.string().trim().optional(),
	email: joi.string().trim().email().optional()
});

// update the userdata

const updateUserSchema = joi.object({
	profileimage: joi.any().optional(),
	name: joi.string().trim().min(2).max(100).optional(),
	email: joi.string().trim().email().optional(),
	password: joi.string().trim().min(6).max(30).optional(),
	npassword: joi.string().trim().min(6).max(30).allow("").optional(),
	cpassword: joi.any().valid(joi.ref("npassword")).allow("").optional()
});



// reset password 

const resetPasswordSchema=Joi.object({
	password:joi.string().trim().max(30).optional()
})


              // coupon

const CouponValidationSchema=joi.object({
	couponname:joi.string().required().trim().min(2).max(100).message({
		'any.required': 'Coupon Name is required',
    'string.empty': 'Coupon Name cannot be empty',
  }),
  couponDescription: Joi.string().required().trim().min(5).max(300).messages({
    'any.required': 'Coupon Description is required',
    'string.empty': 'Coupon Description cannot be empty',
  }),
  discount: Joi.number().required().min(0).messages({
    'any.required': 'Discount is required',
    'number.base': 'Discount must be a number',
    'number.min': 'Discount cannot be negative',
  }),
  minimumPurchase:Joi.number().required().min(0).messages({
    'any.required': 'Minimum purachase amount is required',
    'number.base': 'Minimum purachase amount must be a number',
    'number.min': 'Minimum purachase amount cannot be negative',
  }),
  validFrom: Joi.date().required().messages({
    'any.required': 'Valid From date is required',
    'date.base': 'Valid From must be a valid date',
  }),
  validUntil: Joi.date().required().messages({
    'any.required': 'Valid Until date is required',
    'date.base': 'Valid Until must be a valid date',
  }),
}).custom((value, helpers) => {
  if (value.validFrom && value.validUntil && value.validFrom >= value.validUntil) {
    return helpers.error('date.startEnd', { message: 'Valid From must be less than Valid Until' });
  }
  return value;
}).messages({
  'date.startEnd': 'Valid From must be less than Valid Until',
});
	








module.exports = {
	signupvalidationSchema,
	addProductSchema,
	updateproductschema,
	updateUserSchema,
	addressSchema,
	resetPasswordSchema,
	CouponValidationSchema
};

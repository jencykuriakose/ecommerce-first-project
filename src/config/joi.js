const joi = require("joi");

const addproductSchema = joi.object({
	productname: joi.string().trim().min(3).max(100).required().message({
		"string.base": "product must be an string",
		"string.empty": "product title is required",
		"string.min": "product title must be 3 character long",
		"string.max": "product title cannot exceed 100 characters"
	}),

	productdescription: joi.string().trim().min(6).max(300).required().message({
		"string.base": "description must be a string",
		"string.empty": "description is required",
		"string.min": "description must be 6 character long",
		"string:max": "description cannot exceed 300 characters"
	}),
	productprice: joi.number().positive().required().message({
		"number.base": "regular price must be a number",
		"number.positive": "regular price must be a positive number",
		"any.required": "regular price is required"
	}),

	productoldprice: joi.number().positive().required().message({
		"number.base": "old price must be a number",
		"number.positive": "old price must be a positive number",
		"any.required": "old price is required "
	}),
	stocks: joi.number().integer().positive().required().messages({
		"number.base": "Stocks must be a number",
		"number.integer": "Stocks must be an integer",
		"number.positive": "Stocks must be a positive number",
		"any.required": "Stocks is required"
	}),
	productcategory: joi.string().required().messages({
		"any.required": "Category is required"
	}),
	productImage: joi.array().required().messages({
		"any.required": "Product image is required"
	})
});

const updateproductSchema = joi
	.object({
		productname: joi.string().trim().min(3).max(100).required().message({
			"string.base": "product must be an string",
			"string.empty": "product title is required",
			"string.min": "product title must be 3 character long",
			"string.max": "product title cannot exceed 100 characters"
		}),

		productdescription: joi.string().trim().min(6).max(300).required().message({
			"string.base": "description must be a string",
			"string.empty": "description is required",
			"string.min": "description must be 6 character long",
			"string:max": "description cannot exceed 300 characters"
		}),
		productprice: joi.number().positive().required().message({
			"number.base": "regular price must be a number",
			"number.positive": "regular price must be a positive number",
			"any.required": "regular price is required"
		}),

		productoldprice: joi.number().positive().required().message({
			"number.base": "old price must be a number",
			"number.positive": "old price must be a positive number",
			"any.required": "old price is required "
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
		}),
		productid: joi.any().optional()
	})
	.min(1);

module.exports = {
	addproductSchema,
	updateproductSchema
};

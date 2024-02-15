	const productDatabase = require("../schema/product.schema");
	const orderDatabase=require("../schema/order.schema");
	const categoryDatabase = require("../schema/category.schema")
	const cloudinary = require("../config/cloudinary");
	const { Error } = require("mongoose");
	const CategoryModel = require("./category.model");

	class ProductModel {
		constructor() {}

		async GetAllproducts(page,limit,sortBy) {
			let filterOptions={};
			let sortOptions={}
			console.log(page,sortBy,limit)
			if (sortBy) {
				switch (sortBy) {
				case 'featured':
					filterOptions = { featured: true };
					break;
				case 'lowToHigh':
					sortOptions = { productPrice: 1 }; // Sort by price: low to high
					break;
				case 'highToLow':
					sortOptions = { productPrice: -1 }; // Sort by price: high to low
					break;
				case 'releaseDate':
					sortOptions = { createdAt: -1 }; // Sort by release date (descending)
					break;
				default:
					break;
				}
			}

			let query = productDatabase.find({ productstatus: { $in: [true, false] } });

			if (Object.keys(filterOptions).length > 0) {
				query = query.find(filterOptions);
			}

			//   let sortOptions = {};
			// 	if (filterOptions.productPrice) {
			// 	sortOptions.productPrice = filterOptions.productPrice;
			// 	} else if (filterOptions.createdAt) {
			// 	sortOptions.createdAt = filterOptions.createdAt;
			// 	}

			let products = await query
			.populate('productCategory')
			.sort(sortOptions)
			.skip((page - 1) * limit)
			.limit(limit);
			let totalProducts = await productDatabase.countDocuments({
			productstatus: { $in: [true, false] },
			...filterOptions,
			});
		
			let totalPages = Math.ceil(totalProducts / limit);
			
			return {
				status: true,
				products: products,
				totalPages: totalPages,
				currentPage: page,
				limit: limit,
				productCount: totalProducts,
				sortOption:sortBy
			};
		}

		async addNewProduct(dataBody, datafiles) {
			const { productName, productDescription, productOldPrice, stocks, productCategory } = dataBody;
			let {productPrice} = dataBody;
			console.log(dataBody);
			const category = await categoryDatabase.findById({_id:productCategory});
			if(category.discount){
				let discount = (productPrice * category.discount)/100;
				productPrice = Math.floor(productPrice - discount);
			}
			const product = new productDatabase({
				productName: productName,
				productDescription: productDescription,
				productPrice: productPrice,
				productOldPrice: productOldPrice,
				stocks: stocks,
				productCategory: productCategory
			});

			const imageurllist = [];
			for (let i = 0; i < datafiles.length; i++) {
				let localFilePath = datafiles[i].path;
				let response = await cloudinary.uploader.upload(localFilePath, {
					folder: "wosofy/product-images",
					unique_filename: true
				});
				imageurllist.push(response.url);
			}
			product.productimageurl = imageurllist;

			console.log(product.productimageurl);

			const result = await product.save();

			console.log(result);

			if (result) {
				return { status: true };
			} else {
				return { status: false };
			}
		}

		async LoadProductDetails(productId) {
			const product = await productDatabase.findOne({ _id: productId });
			if (!product) {
				return { status: false, message: "Product not found" };
			} else {
				return { status: true, product: product };
			}
		}
		async getEditProduct(productId) {
			const product = await productDatabase.findById({ _id: productId }).populate("productCategory");
			if (product) {
				return { status: true, product };
			} else {
				return { status: false, message: "Error fetching product details" };
			}
		}
		async getProductImage(productId) {
			const product = await productDatabase.findById(productId).select("productimageurl");
			if (!product) {
				return { status: false };
			}
			return { status: true, product };

		}


		async updateProductStatus(productId) {
			const product = await productDatabase.findByIdAndUpdate(
			{ _id: productId },
			{ $set: { productstatus: false } },
			);
			if (product) {
			return { status: true, product };
			} else {
			return { status: false };
			}
		}




	async updateProduct(productId, productData, productimage) {
		const product = await productDatabase.findById(productId);
		if (!product) {
		throw new Error('Product not found');
		}

		if (
		productimage &&
		product.productimageurl.length < 4 &&
		product.productimageurl.length + productimage.length < 4
		) {
		for (let i = 0; i < productimage.length; i++) {
			let locaFilePath = productimage[i].path;
			let response = await cloudinary.uploader.upload(locaFilePath, {
			folder: 'wosofy/product_images',
			unique_filename: true,
			});
			product.productimageurl.push(response.url);
		}
		}
		
		product.productName = productData.productName || product.productName;
		product.productDescription = productData.productDescription || product.productDescription;
		product.productPrice = productData.productPrice || product.productPrice;
		product.productoldprice = productData.productOldPrice || product.productoldprice;
		product.stocks = productData.stocks || product.stocks;
		product.productCategory = productData.productCategory || product.productCategory;

		const updatedProduct = await product.save();

		return updatedProduct;
	}



	// async searchProductsWithRegex(searchRegex){
	// 	try{
	// const products=await productDatabase.find({productName:searchRegex});
	// return products;

	// 	}catch(error){
	// 		throw new Error('error while searcing product');
	// 	}
	// }

	// Updated searchProductsWithRegex function

	// async searchProductsWithRegex(searchRegex) {
	//     try {
	//         const products = await productDatabase.find({ productName: searchRegex });
	//         return products;
	//     } catch (error) {
	//         throw new Error('Error while searching for products');
	//     }
	// }
	async  searchProductsWithRegex(searchRegex) {
		try {
		const products = await productDatabase.find({ productName: searchRegex });
		return products;
		} catch (error) {
		throw new Error(`Error while searching products`);
		}
	}



	async updateProductStocks(orderId,changeStatus){
		try {
			const order = await orderDatabase.findById(orderId).populate('items.product');
			if (!order) {
			throw new Error('Order not found');
			}
			console.log(order);
			if (changeStatus === 'returned' || changeStatus === 'canceled') {
			for (const item of order.items) {
				const productId = item.product._id;
				const returnedQuantity = item.quantity;
				const product = await productDatabase.findById(productId);
		
				if (!product) {
				throw new Error('Product not found');
				}
				product.stocks += returnedQuantity;
				await product.save();
			}
			}
		} catch (error) {
			throw new Error(`Failed to update product stocks: ${error.message}`);
		}
		}








	}


		
	


	module.exports = ProductModel;

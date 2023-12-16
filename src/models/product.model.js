const productDatabase = require("../schema/product.schema");
const cloudinary = require("../config/cloudinary");

class ProductModel {
	constructor() {}

	async GetAllproducts(page, limit) {
		var products = await productDatabase.find({ productstatus: true }).populate("productCategory");
		const totalProducts = await productDatabase.countDocuments();
		const totalPages = Math.ceil(totalProducts / limit);

		return {
			status: true,
			products: products,
			totalPages: totalPages,
			currentPage: page,
			limit: limit,
			productCount: totalProducts
		};
	}

	async addNewProduct(dataBody, datafiles) {
		const { productName, productDescription, productPrice, productOldPrice, stocks, productCategory } = dataBody;
		console.log(dataBody);
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




}


	
  


 module.exports = ProductModel;

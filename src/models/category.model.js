const categoryDatabase = require("../schema/category.schema");

class CategoryModel {
	constructor() {}
	async fetchCategories() {
		try {
			const categories = await categoryDatabase.find({});
			if (categories) {
				return { status: true, categories };
			} else {
				return { status: false };
			}
		} catch (error) {
			throw new Error(`Error finding categories: ${error.message}`);
		}
	}

	async addCategory(name, discount) {
		const isCategoryExist = await categoryDatabase.findOne({ name:{ $regex: new RegExp(`^${name}$`, 'i') } });
		if (isCategoryExist) {
			return { status: false, message: `Category name already exsist` };
		}
		const category = new categoryDatabase({
			name: name,
			discount: discount,
			active: true
		});
		const result = await category.save();
		if (result) {
			return { status: true, message: "Category added succesfully" };
		} else {
			return { status: false, message: "Category not added" };
		}
	}

	async updateCategory(categoryId, updateStatus) {
		const Category = await categoryDatabase.updateOne({ _id: categoryId }, { $set: { active: updateStatus } });
		if (Category.modifiedCount > 0) {
			return { status: true };
		} else {
			return { status: false };
		}
	}
}

module.exports = CategoryModel;

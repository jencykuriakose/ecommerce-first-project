const UserDatabase = require("../schema/user.schema");

class UserModel {
	constructor() {}

	async findByPhone(phone) {
		const userExist = await UserDatabase.findOne({ phone });
		return userExist;
	}

	async createUser(data) {
		const user = await UserDatabase.create({ ...data });
		return { status: true, user };
	}

	async fetchAllUsers() {
		const users = await UserDatabase.find({});
		return { status: true, users };
	}

	async fetchAllUsers(page, limit) {
		try {
			const users = await UserDatabase
				.find({})
				.skip((page - 1) * limit)
				.limit(limit);

			const totalOrders = await UserDatabase.countDocuments();
			const totalPages = Math.ceil(totalOrders / limit);

			if (users) {
				return { status: true, users, totalPages, limit, page };
			} else {
				return { status: false };
			}
		} catch (error) {
			throw new Error(`Error fetching users: ${error.message}`);
		}
	}
}

module.exports = UserModel;

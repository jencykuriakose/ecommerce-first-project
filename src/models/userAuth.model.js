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
}

module.exports = UserModel;

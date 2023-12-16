const { compare } = require("bcrypt");
const UserDatabase = require("../schema/user.schema");
const { comparePassword,hashPassword } = require("../config/security");
const cloudinary = require("../config/cloudinary");

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
			const users = await UserDatabase.find({})
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
	async FindUserWithId(userId, action) {
		const user = await UserDatabase.findById(userId);
		if (!user) {
			return { status: false };
		} else {
			if (action === "block") {
				user.status = false;
			} else if (action === "unblock") {
				user.status = true;
			}
			await user.save();
			return { status: true };
		}
	}
	async CheckUserBlockOrUnblock(userId, status) {
		const user = await UserDatabase.findById(userId, status);
		if (user) {
			if (user.status === "blocked") {
				return { status: blocked, message: "user is blocked" };
			} else {
				return { status: unblocked, message: "user is unblocked" };
			}
		}
	}

	async CheckUserWithEmail(email, password) {
		const user = await UserDatabase.findOne({ email });
		if (!user) {
			return { status: false, message: "invalid email" };
		}
		if (!user.status) {
			return { status: false, message: "user is blocked" };
		}
		const IsPasswordMatch = await comparePassword(password, user.password);
		if (IsPasswordMatch) {
			return { status: true, user: user, message: "Login successfully" };
		} else {
			return { status: false, message: "invalid password" };
		}
	}


	async updateuserdata(userData,profileimage,userId){
		if (typeof userData !== 'object' || typeof userId !== 'string') {
			throw new Error('Invalid parameters');
		  }
		  const user = await UserDatabase.findById(userId);
		  if (!user) {
			throw new Error('User does not exist');
		  }
		  console.log(user,userData)
		  const isPasswordCorrect = await comparePassword(userData.password,user.password);
	  
		  if (!isPasswordCorrect) {
			throw new Error('Incorrect password');
		  }
	  
		  const dataObj = {};
	  
		  if (userData.password && userData.npassword) {
			dataObj.password = await hashPassword(userData.npassword);
		  }
	  
		  if (userData.name) {
			dataObj.username = userData.name;
		  }
	  
		  if (profileimage) {
			const response = await cloudinary.uploader.upload(profileimage.path, {
			  folder: 'wosofy/profile_images',
			  unique_filename: true,
			});
			dataObj.profileimage = response.url;
		  }
	  
		  const filter = { _id: userId };
		  const update = { $set: dataObj };
		  const result = await UserDatabase.updateOne(filter, update);
		  const updatedUser = await UserDatabase.findById(userId)
		  
	  
		  if (result.modifiedCount > 0) {
			return { status: true, message: 'Updated successfully',user:updatedUser};
		  } else {
			throw new Error('Updation failed');
		  }

	}











}

module.exports = UserModel;

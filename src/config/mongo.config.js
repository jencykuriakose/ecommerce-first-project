const mongoose = require("mongoose");

async function connectMongodb() {
	try {
		await mongoose.connect(process.env.MONGODB_URL);
		console.log("mongodb connected😊");
	} catch (error) {
		console.log(error);
	}
}

module.exports = connectMongodb;

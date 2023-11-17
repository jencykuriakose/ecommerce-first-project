const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const bodyparser = require("body-parser");
const connectMongodb = require("./config/mongo.config");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(morgan("dev"));
app.use(bodyparser.json());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", (req, res) => {
	res.render("home");
});


const start = async () => {
	await connectMongodb();

	app.listen(PORT, () => {
		console.log(`server is running ${PORT}`);
	});

	process.on("uncaughtException", () => {
		process.exit(1);
	});
};

start();

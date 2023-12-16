const {cartProducts, loggedInMiddleware} = require('./middleware/custom.middleware')
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const cookieparser = require("cookie-parser");
const bodyparser = require("body-parser");
const connectMongodb = require("./config/mongo.config");
const userRoute = require("./routes/user.route");
const adminRoute = require("./routes/admin.route");
const handleError = require("./middleware/error-handler.middleware");


const PORT = process.env.PORT || 5000;

const app = express();

app.use(morgan("dev"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieparser());

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7 //1 week
		}
	})
);

// view engine setup

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// custom middleware

app.use(cartProducts);
app.use(loggedInMiddleware);

app.use("/", userRoute);
app.use("/admin", adminRoute);

// app.use({handleError});

const start = async () => {
	await connectMongodb();

	app.listen(PORT, () => {
		console.log(`server is running ${PORT}`);
	});
};

start();

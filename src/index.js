const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const bodyparser=require("body-parser")


const PORT = process.env.PORT || 5000;

app.use(morgan("dev"))
app.use(bodyparser.json())


app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", (req, res) => {
	res.render("home");
});

app.listen(PORT, () => {
	console.log(`server is running ${PORT}`);
});

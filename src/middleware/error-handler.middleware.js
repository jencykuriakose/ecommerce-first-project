const handleError = (error, req, res, next) => {
	console.log("error handler", error);
	res.status(500).json({ message: "error" });
};

module.exports = handleError;

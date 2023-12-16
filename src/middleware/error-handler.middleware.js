 const handleError = (res,error) => {
	console.log("error handler", error);
	res.status(500).json({status:false,message: error?.Message });
};

module.exports = {handleError};



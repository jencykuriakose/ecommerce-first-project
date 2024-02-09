const userDatabase=require("../schema/user.schema");
//users

function IsLoggedIn(req, res, next) {
	if (req.session.userloggedIn) {
		next();
	} else {
		res.redirect("/login");
	}
}

function IsLoggedOut(req, res, next) {
	if (!req.session.IsLoggedOut) {
		next();
	} else {
		res.redirect("/");
	}
}

const isBlocked = async (req,res,next)=>{

	const id = req.session.user;
	console.log('User ID:',id);
	const user = await userDatabase.findById(id);
	console.log('User:',user);
	 
	if (user && user.status === false) {
		console.log('Blocked user, redirecting to login');
		   res.redirect('/login')
	} else {
		console.log('User not blocked, proceeding to the next middleware');
	 next()
	}
 }

//admin

function IsAdminLoggedIn(req, res, next) {
	if (req.session.adminLoggedIn) {
		next();
	} else {
		res.redirect("/admin/login");
	}
}

function IsAdminLoggedOut(req, res, next) {
	if (!req.session.IsAdminLoggedOut) {
		next();
	} else {
		res.render("/admin/dashboard");
	}
}


module.exports = {
	IsLoggedIn,
	IsLoggedOut,
	IsAdminLoggedIn,
	IsAdminLoggedOut,
	isBlocked
};

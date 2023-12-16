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
	IsAdminLoggedOut
};

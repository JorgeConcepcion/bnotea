//VAR DECLARATION
var express = require("express"),
	moment=require("moment"),
	router = express.Router({
		mergeParams: true
	}),
	//models
	Superuser = require("../models/superuser"),
	Log=require("../models/log"),
	//midleware
	Middleware = require("../middleware");

//SHOW ROUTE    
router.get("/:superuserID", Middleware.isLoggedIn, Middleware.isSuperuser, Middleware.isAuthorizedSuperuser, function (req, res) {
	Superuser.findById(req.params.superuserID, function (err, superuser) {
		if (err) {
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else {
			res.render("superuser/show", {
				page: "superuser-show",
				superuser: superuser,
				superuserID: req.params.superuserID
			});
		}
	});
});

//EDIT ROUTE
router.get("/:superuserID/edit", Middleware.isLoggedIn, Middleware.isSuperuser, Middleware.isAuthorizedSuperuser, function (req, res) {
	Superuser.findById(req.params.superuserID, function (err, superuser) {
		if (err) {
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else {
			res.render("superuser/edit", {
				page: "superuser-edit",
				superuser: superuser,
				superuserID: req.params.superuserID
			});
		}
	});
});

//UPDATE ROUTE
router.put("/:superuserID", Middleware.isLoggedIn, Middleware.isSuperuser, Middleware.isAuthorizedSuperuser, function (req, res) {
	Superuser.findByIdAndUpdate(req.params.superuserID, {
		$set: req.body.superuser
	}, function (err, superuser) {
		if (err) {
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else {
			let info="updated superuser id: "+req.params.superuserID;
			Log.create({info:info,code:"SUPERUSERUPDATE",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
			req.flash("success", "Profile successfully updated");
			res.redirect("/superuser/" + superuser._id);
		}
	});
});

module.exports = router;

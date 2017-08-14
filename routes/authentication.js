
//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	passport=require("passport"),
	//models
	Superuser=require("../models/superuser");

//LOGIN ROUTE: SHOW LOGIN FORM 
router.get("/login",function(req,res){
	res.render("authentication/login",{page:"login"});
});

//LOGIN ROUTE:CHECK LOGIN CREDENTIALS 
router.post("/login",passport.authenticate("local",{
	failureRedirect:"/login",
	failureFlash:true,
	successFlash: "Successfully logged in"
}),function(req,res){
	if(req.user.type=="superuser"){
		res.redirect("/superuser/"+req.user.userRef);   
	}
	if(req.user.type=="assistant"){
		Superuser.findOne({assistants:req.user.userRef},function(err,superuser){
			if(err){
				req.flash("error",err.message+", please login again to continue");
				req.logout();
				res.redirect("/login");
			}
			else{
				res.redirect("/superuser/"+superuser._id+"/assistant/"+req.user.userRef);
			}
		});
	}
	if(req.user.type=="analyst"){
		Superuser.findOne({analysts:req.user.userRef},function(err,superuser){
			if(err){
				req.flash("error",err.message+", please login again to continue");
				req.logout();
				res.redirect("/login");
			}
			else{
				res.redirect("/superuser/"+superuser._id+"/analyst/"+req.user.userRef);
			}
		});
	}
});

//LOGOUT ROUTE
router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

//CHANGE PASSWORD ROUTE: SHOW CHANGE PASSWORD FORM
router.get("/change",function(req,res){
	req.logout();
	res.render("authentication/change",{page:"change"});
});

//CHANGE PASSWORD ROUTE: ACTUALLY CHANGE THE PASSWORD
router.post("/change",passport.authenticate("local",{
	failureRedirect:"/change",
	failureFlash: true
}),function(req,res){
	if(req.body.newPassword==req.body.repeatNewPassword){
		if(req.body.password!=req.body.newPassword){
			req.user.setPassword(req.body.newPassword,function(err){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					res.redirect("/login");
				}
				else{
					req.user.save();
					req.logout();
					req.flash("success","Your password has been changed");
					res.redirect("/login");
				}
			});
		}
		else{
			req.flash("error","The new password must be different from the previous password");
			res.redirect("/change");
		}
	}
	else{
		req.flash("error","Passwords don't match");
		res.redirect("/change");
	}
});


module.exports=router;
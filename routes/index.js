//VAR DECLARATION
var express=require("express"),
	Log=require("../models/log"),
	router=express.Router({mergeParams:true}),
	//midleware
	Middleware=require("../middleware");

//LANDING PAGE ROUTE    
router.get("/",Middleware.isLoggedInLandingPage,function(req,res){
	res.render("landing",{page:"landing"});
});  
    



module.exports=router;
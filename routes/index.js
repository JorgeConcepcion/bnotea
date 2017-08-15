//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	//midleware
	Middleware=require("../middleware");

//LANDING PAGE ROUTE    
router.get("/",Middleware.isLoggedInLandingPage,function(req,res){
	res.render("landing",{page:"landing"});
});  
    

//GOOGLE VERIFICATION ROUTE

module.exports=router;
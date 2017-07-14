var express=require("express"),
    router=express.Router({mergeParams:true}),
    Middleware=require("../middleware");
    
router.get("/",Middleware.isLoggedInLandingPage,function(req,res){
    res.render("landing",{page:"landing"});
})   
    


module.exports=router;
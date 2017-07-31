//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true});
   

//DEFAULT ROUTE 
router.get("*",function(req,res){
	res.render("page404",{page:"page404"});
});  
    


module.exports=router;
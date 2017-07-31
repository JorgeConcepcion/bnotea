//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true});
    
router.get("/new",function(req,res){
	res.render("report/new",{page:"report-new",superuserID:req.user.userRef});
});

module.exports = router;
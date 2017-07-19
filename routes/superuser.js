//VAR DECLARATION
var express=require("express"),
    router=express.Router({mergeParams:true}),
    //models
    Superuser=require("../models/superuser"),
    //midleware
    Middleware=require("../middleware");

//SHOW ROUTE    
router.get("/:superuserID",function(req,res){
    Superuser.findById(req.params.superuserID,function(err,superuser){
        if(err){
            console.log(err);
        }
        else{
            res.render("superuser/show",{page:"superuser-show",superuser:superuser,superuserID:req.params.superuserID});
        }
    });
});

//EDIT ROUTE
router.get("/:superuserID/edit",Middleware.isLoggedIn,function(req,res){
    Superuser.findById(req.params.superuserID,function(err,superuser){
        if(err){
            console.log(err);
        }
        else{
            res.render("superuser/edit",{page:"superuser-edit",superuser:superuser,superuserID:req.params.superuserID});
        }
    });
});

//UPDATE ROUTE
router.put("/:superuserID",Middleware.isLoggedIn,function(req,res){
    Superuser.findByIdAndUpdate(req.params.superuserID,{$set:req.body.superuser},function(err,superuser){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/superuser/"+superuser._id);
        }
    });
});

module.exports=router;
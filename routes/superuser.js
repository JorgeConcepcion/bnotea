var express=require("express"),
    router=express.Router({mergeParams:true}),
    Superuser=require("../models/superuser"),
    Middleware=require("../middleware");
    
router.get("/:superuserID",Middleware.isLoggedIn,function(req,res){
     Superuser.findById(req.params.superuserID,function(err,superuser){
        if(err){
            console.log(err);
        }
        else{
            res.render("superuser/show",{page:"dashboard",superuser:superuser});
        }
    })
})

router.get("/:superuserID/edit",Middleware.isLoggedIn,function(req,res){
     Superuser.findById(req.params.superuserID,function(err,superuser){
        if(err){
            console.log(err);
        }
        else{
            res.render("superuser/edit",{page:"dashboard",superuser:superuser});
        }
    })
})

router.put("/:superuserID",Middleware.isLoggedIn,function(req,res){
     Superuser.findByIdAndUpdate(req.params.superuserID,{$set:req.body.superuser},function(err,superuser){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/superuser/"+superuser._id);
        }
    })
})

module.exports=router;
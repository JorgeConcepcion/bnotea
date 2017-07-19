
//VAR DECLARATION
var express=require("express"),
    router=express.Router({mergeParams:true}),
    passport=require("passport"),
    //midleware
    Middleware=require("../middleware"),
    //models
    Superuser=require("../models/superuser");

//LOGIN ROUTE: SHOW LOGIN FORM 
router.get("/login",function(req,res){
     res.render("authentication/login",{page:"login"});
});

//LOGIN ROUTE:CHECK LOGIN CREDENTIALS 
router.post("/login",passport.authenticate("local",{
    failureRedirect:"/login"
    //failureFlash: true
}),function(req,res){
    if(req.user.type=="superuser"){
        res.redirect("/superuser/"+req.user.userRef);   
    }
    if(req.user.type=="assistant"){
        Superuser.findOne({assistants:req.user.userRef},function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/superuser/"+superuser._id+"/assistant/"+req.user.userRef);
            }
        })
    }
    if(req.user.type=="analist"){
        Superuser.findOne({analists:req.user.userRef},function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/superuser/"+superuser._id+"/analist/"+req.user.userRef);
            }
        })
    }
});

//LOGOUT ROUTE
router.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

//CHANGE PASSWORD ROUTE: SHOW CHANGE PASSWORD FORM
router.get("/change",Middleware.isLoggedIn,function(req,res){
    req.logout();
    res.render("authentication/change",{page:"change"});
});

//CHANGE PASSWORD ROUTE: ACTUALLY CHANGE THE PASSWORD
router.post("/change",passport.authenticate("local",{
    failureRedirect:"/change"
    //failureFlash: true
}),function(req,res){
        if(req.body.newPassword==req.body.repeatNewPassword){
            if(req.body.password!=req.body.newPassword){
                req.user.setPassword(req.body.newPassword,function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        req.user.save();
                        req.logout();
                        res.redirect("/login");
                    }
                });
            }
            else{
                console.log("Same as old one");
                res.redirect("/change");
            }
        }
        else{
            console.log("Passwords dont match");
            res.redirect("/change");
        }
});


module.exports=router;
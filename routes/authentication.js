
var User=require("../models/user"),
    express=require("express"),
    router=express.Router({mergeParams:true}),
    passport=require("passport"),
    Superuser=require("../models/superuser"),
     Middleware=require("../middleware");
    
router.get("/login",function(req,res){
     res.render("authentication/login",{page:"login"});
})

router.post("/login",passport.authenticate("local",{
    failureRedirect:"/login"
    //failureFlash: true
}),function(req,res){
    if(req.user.type=="superuser"){
     res.redirect("/superuser/"+req.user.userRef);   
    }
})
router.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})
router.get("/change",Middleware.isLoggedIn,function(req,res){
    req.logout();
    res.render("authentication/change",{page:"change"});
})
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
            })
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
})
module.exports=router;
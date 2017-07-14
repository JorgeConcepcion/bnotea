
var User=require("../models/user"),
    express=require("express"),
    router=express.Router({mergeParams:true}),
    passport=require("passport"),
    Superuser=require("../models/superuser");
    
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
router.get("/change",function(req,res){
    req.logout();
    res.render("authentication/change",{page:"change"});
})
router.post("/change",function(req,res){
    //TODO COMPLETE THE CHANGE PASSWORD PIECE
})
module.exports=router;
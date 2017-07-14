
var midlewareObj={}

midlewareObj.isLoggedIn= function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
midlewareObj.passCurrentUser=function(req,res,next){
    res.locals.currentUser=req.user;
    next();
}

midlewareObj.isLoggedInLandingPage=function(req,res,next){
     if(req.isAuthenticated()){
         if(req.user.type=="superuser"){
            return res.redirect("/superuser/"+req.user.userRef); 
         }
    }
    next();
}
module.exports=midlewareObj;
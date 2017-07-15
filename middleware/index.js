
var midlewareObj={};

//CHECK IF AN USER IS LOGGED IN
midlewareObj.isLoggedIn= function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

//PASS THE CURRENT USER VARIABLE TO ALL TEH EJS TEMPLATES
midlewareObj.passCurrentUser=function(req,res,next){
    res.locals.currentUser=req.user;
    next();
};

//CHECK IF A USER THAT ARRIVES TO THE LANDING PAGE IS ALREADY LOGGED IN
midlewareObj.isLoggedInLandingPage=function(req,res,next){
    if(req.isAuthenticated()){
         if(req.user.type=="superuser"){
            return res.redirect("/superuser/"+req.user.userRef); 
         }
    }
    next();
};

module.exports=midlewareObj;
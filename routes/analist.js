//VAR DECLARATION
var express=require("express"),
    router=express.Router({mergeParams:true}),
    //models
    Superuser=require("../models/superuser"),
    Analist=require("../models/analist"),
    User=require("../models/user"),
    //midleware
    Middleware=require("../middleware");
    
//INDEX ROUTE 
router.get("/",Middleware.isLoggedIn,function(req,res){
    var regex;
    if(req.query.search){
        regex=new RegExp(escapeRegex(req.query.search),"gi");
        Superuser.findById(req.params.superuserID).populate("analists",null,{firstName:regex}).exec(function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.render("analist/index",{page:"analist-index",superuser:superuser});
            }
        });
    }
    else{
        Superuser.findById(req.params.superuserID).populate("analists").exec(function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.render("analist/index",{page:"analist-index",superuser:superuser});
            }
        });
    }    
});

//NEW ROUTE
router.get("/new",Middleware.isLoggedIn,function(req,res){
    Superuser.findById(req.params.superuserID,function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.render("analist/new",{page:"analist-new",superuser:superuser});
            }
        });
});

//CREATE ROUTE
router.post("/",Middleware.isLoggedIn,function(req,res){
    req.body.analist.photo="/resources/Person-placeholder.jpg";
    Analist.create(req.body.analist,function(err,analist){
        if(err){
            console.log(err);
        }
        else{
             Superuser.findById(req.params.superuserID,function(err,superuser){
                if(err){
                    console.log(err);
                }
                else{
                    superuser.analists.push(analist);
                    superuser.save();
                    User.register(new User({username:req.body.username,type:"analist",userRef:analist._id}),req.body.password,function(err,user){
                       if(err){
                           console.log(err);
                       }
                       else{
                           res.redirect("/superuser/"+superuser._id+"/analist");
                       }
                       
                    });
                }
            });
        }
    });
});

//SHOW ROUTE
router.get("/:analistID",function(req,res){
         Superuser.findById(req.params.superuserID,function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                Analist.findById(req.params.analistID,function(err,analist){
                    if(err){
                        console.log(err);
                    }
                    else{
                         res.render("analist/show",{page:"analist-show",superuser:superuser,analist:analist});
                    }
                });
               
            }
        }); 
});

//EDIT ROUTE
router.get("/:analistID/edit",Middleware.isLoggedIn,function(req,res){
    Superuser.findById(req.params.superuserID,function(err,superuser){
                if(err){
                    console.log(err);
                }
                else{
                    Analist.findById(req.params.analistID,function(err,analist){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.render("analist/edit",{page:"analist-edit",superuser:superuser,analist:analist});
                         }
                    });
                }
    });
});

//UPDATE ROUTE
router.put("/:analistID",Middleware.isLoggedIn,function(req,res){
    Analist.findByIdAndUpdate(req.params.analistID,{$set:req.body.analist},function(err,analist){
        if(err){
            console.log(err);
        }
        else{
            
            res.redirect("/superuser/"+req.params.superuserID+"/analist/"+req.params.analistID);
        }
        
    });
});

//DELETE ROUTE
router.delete("/:analistID",Middleware.isLoggedIn,function(req,res){
    
    Superuser.findByIdAndUpdate(req.params.superuserID,{$pull:{analists:req.params.analistID}},function(err,superuser){
        if(err){
            console.log(err);
        }
        else{
            if(req.body.deleteFlag!="deactivate"){
               Analist.findByIdAndRemove(req.params.analistID,function(err){
                    if(err){
                        console.log(err);
                    }
                
                });
            }
            else{
                 Analist.findByIdAndUpdate(req.params.analistID,{$set:{deactivationSuperuser:req.params.superuserID}},function(err,analist){
                    if(err){
                        console.log(err);
                    }
                
                }); 
            }
        res.redirect("/superuser/"+req.params.superuserID+"/analist");
        }
    });
});


//HELPER FUNCTION USED TO FILTER THE FUZZY SEARCHS
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
}
    
    
    
    
    
module.exports=router;
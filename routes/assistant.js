//VAR DECLARATION
var express=require("express"),
    router=express.Router({mergeParams:true}),
    //models
    Superuser=require("../models/superuser"),
    Assistant=require("../models/assistant"),
    User=require("../models/user"),
    //midleware
    Middleware=require("../middleware");
 
//INDEX ROUTE  
router.get("/",Middleware.isLoggedIn,function(req,res){
    var regex;
    if(req.query.search){
        regex=new RegExp(escapeRegex(req.query.search),"gi");
        Superuser.findById(req.params.superuserID).populate("assistants",null,{firstName:regex}).exec(function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.render("assistant/index",{page:"assistant-index",superuser:superuser});
            }
        });
    }
    else{
        Superuser.findById(req.params.superuserID).populate("assistants").exec(function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.render("assistant/index",{page:"assistant-index",superuser:superuser});
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
                res.render("assistant/new",{page:"assistant-new",superuser:superuser});
            }
        });
});

//CREATE ROUTE
router.post("/",Middleware.isLoggedIn,function(req,res){
    req.body.assistant.photo="/resources/Person-placeholder.jpg";
    Assistant.create(req.body.assistant,function(err,assistant){
        if(err){
            console.log(err);
        }
        else{
             Superuser.findById(req.params.superuserID,function(err,superuser){
                if(err){
                    console.log(err);
                }
                else{
                    superuser.assistants.push(assistant);
                    superuser.save();
                    User.register(new User({username:req.body.username,type:"assistant",userRef:assistant._id}),req.body.password,function(err,user){
                       if(err){
                           console.log(err);
                       }
                       else{
                           res.redirect("/superuser/"+superuser._id+"/assistant");
                       }
                       
                    });
                }
            });
        }
    });
});

//SHOW ROUTE
router.get("/:assistantID",function(req,res){
         Superuser.findById(req.params.superuserID,function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                Assistant.findById(req.params.assistantID,function(err,assistant){
                    if(err){
                        console.log(err);
                    }
                    else{
                         res.render("assistant/show",{page:"assistant-show",superuser:superuser,assistant:assistant});
                    }
                });
               
            }
        }); 
});


//EDIT ROUTES
router.get("/:assistantID/edit",Middleware.isLoggedIn,function(req,res){
    Superuser.findById(req.params.superuserID,function(err,superuser){
                if(err){
                    console.log(err);
                }
                else{
                    Assistant.findById(req.params.assistantID,function(err,assistant){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.render("assistant/edit",{page:"assistant-edit",superuser:superuser,assistant:assistant});
                        }
                    });
                }
    });
});

//UPDATE ROUTE
router.put("/:assistantID",Middleware.isLoggedIn,function(req,res){
    Assistant.findByIdAndUpdate(req.params.assistantID,{$set:req.body.assistant},function(err,assistant){
        if(err){
            console.log(err);
        }
        else{
            
            res.redirect("/superuser/"+req.params.superuserID+"/assistant/"+req.params.assistantID);
        }
        
    });
});


//DELETE ROUTE
router.delete("/:assistantID",Middleware.isLoggedIn,function(req,res){
    Superuser.findByIdAndUpdate(req.params.superuserID,{$pull:{assistants:req.params.assistantID}},function(err,superuser){
        if(err){
            console.log(err);
        }
        else{
            if(req.body.deleteFlag!="deactivate"){
               Assistant.findByIdAndRemove(req.params.assistantID,function(err){
                    if(err){
                        console.log(err);
                    }
                }); 
            }
            else{
                 Assistant.findByIdAndUpdate(req.params.assistantID,{$set:{deactivationSuperuser:req.params.superuserID}},function(err,assistant){
                    if(err){
                        console.log(err);
                    }
                
                }); 
            }
        res.redirect("/superuser/"+req.params.superuserID+"/assistant");
        }
    });
});

//HELPER FUNCTION USED TO FILTER THE FUZZY SEARCHS
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
}
    
    
module.exports=router;
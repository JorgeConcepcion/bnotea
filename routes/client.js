//VAR DECLARATION
var express=require("express"),
    router=express.Router({mergeParams:true}),
    //models
    Superuser=require("../models/superuser"),
    Client=require("../models/client"),
    Assistant=require("../models/assistant"),
    Analist=require("../models/analist"),
    //middleware
    Middleware=require("../middleware");

//INDEX ROUTE
router.get("/",Middleware.isLoggedIn,function(req,res){
    var regex;
    if(req.query.search){
        regex=new RegExp(escapeRegex(req.query.search),"gi");
        Superuser.findById(req.params.superuserID).populate("clients",null,{firstName:regex}).exec(function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.render("client/index",{page:"client-index",superuser:superuser});
            }
        });
    }
    else{
        Superuser.findById(req.params.superuserID).populate("clients").exec(function(err,superuser){
            if(err){
                console.log(err);
            }
            else{
                res.render("client/index",{page:"client-index",superuser:superuser});
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
                res.render("client/new",{page:"client-new",superuser:superuser});
            }
        });
});

//CREATE ROUTE
router.post("/",Middleware.isLoggedIn,function(req,res){
    req.body.client.photo="/resources/Person-placeholder.jpg";
    Client.create(req.body.client,function(err,client){
        if(err){
            console.log(err);
        }
        else{
             Superuser.findById(req.params.superuserID,function(err,superuser){
                if(err){
                    console.log(err);
                }
                else{
                    superuser.clients.push(client);
                    superuser.save();
                    res.redirect("/superuser/"+superuser._id+"/client");
                }
            });
        }
    });
});

//SHOW ROUTE
router.get("/:clientID",Middleware.isLoggedIn,function(req,res){
    Superuser.findById(req.params.superuserID,function(err,superuser){
                if(err){
                    console.log(err);
                }
                else{
                    Client.findById(req.params.clientID,function(err,client){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.render("client/show",{page:"client-show",superuser:superuser,client:client});
                         }
                    });
                }
    });
});

//EDIT ROUTE
router.get("/:clientID/edit",Middleware.isLoggedIn,function(req,res){
    Superuser.findById(req.params.superuserID,function(err,superuser){
                if(err){
                    console.log(err);
                }
                else{
                    Client.findById(req.params.clientID,function(err,client){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.render("client/edit",{page:"client-edit",superuser:superuser,client:client});
                        }
                    });
                }
    });
});

//UPDATE
router.put("/:clientID",Middleware.isLoggedIn,function(req,res){
    Client.findByIdAndUpdate(req.params.clientID,{$set:req.body.client},function(err,client){
        if(err){
            console.log(err);
        }
        else{
            
            res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID);
        }
        
    });
});

//DELETE ROUTE
router.delete("/:clientID",Middleware.isLoggedIn,function(req,res){
    Assistant.findOneAndUpdate({clients:req.params.clientID},{$pull:{clients:req.params.clientID}},function(err,assistant){
        if(err){
            console.log(err);
        }
        else{
            Analist.findOneAndUpdate({clients:req.params.clientID},{$pull:{clients:req.params.clientID}},function(err,analist){
                if(err){
                    console.log(err);
                }
                else{
                     Superuser.findByIdAndUpdate(req.params.superuserID,{$pull:{clients:req.params.clientID}},function(err,superuser){
                        if(err){
                            console.log(err);
                        }
                        else{
                            if(req.body.deleteFlag!="deactivate"){
                                Client.findByIdAndRemove(req.params.clientID,function(err){
                                    if(err){
                                        console.log(err);
                                    }
                
                                }); 
                            }
                            else{
                                Client.findByIdAndUpdate(req.params.clientID,{$set:{deactivationSuperuser:req.params.superuserID}},function(err,client){
                                    if(err){
                                        console.log(err);
                                    }
                
                                }); 
                            }
        
                        }
                    });
                }
            });
        }
    });
   res.redirect("/superuser/"+req.params.superuserID+"/client");
});

//HELPER FUNCTION USED TO FILTER THE FUZZY SEARCHS
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
}


module.exports=router;
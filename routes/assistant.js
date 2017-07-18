//VAR DECLARATION
var express=require("express"),
    router=express.Router({mergeParams:true}),
    //models
    Superuser=require("../models/superuser"),
    Assistant=require("../models/assistant"),
    User=require("../models/user"),
    Client=require("../models/client"),
    //midleware
    Middleware=require("../middleware"),
    //functions
    Functions=require("../functions");
//INDEX ROUTE  
router.get("/",Middleware.isLoggedIn,function(req,res){
    var regex;
    if(req.query.search){
        regex=new RegExp(Functions.escapeRegex(req.query.search),"gi");
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
                Assistant.findById(req.params.assistantID).populate("clients").exec(function(err,assistant){
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
            Assistant.findById(req.params.assistantID).populate("clients").exec(function(err,assistant){
                if(err){
                    console.log(err);
                }
                else{
                    Client.find({'assistant.firstName':"",deactivationSuperuser:{ $exists:false}},function(err,clients){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.render("assistant/edit",{page:"assistant-edit",superuser:superuser,assistant:assistant,clients:clients});
                        }
                    });
                 }
            });
        }
    });
});

//UPDATE ROUTE
router.put("/:assistantID",Middleware.isLoggedIn,function(req,res){
    var assistantFirstName;
    var assistantLastName;
    var assistantClients;
    Assistant.findById(req.params.assistantID,function(err,assistant){
        if(err){
            console.log(err);
        }
        else{
            var assistantFirstName=assistant.firstName; 
            var assistantLastName=assistant.lastName;
            var assistantClients=assistant.clients;
            assistant.clients=[];
            Assistant.findByIdAndUpdate(req.params.assistantID,req.body.assistant,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    var addedClients=Functions.arraycmp(req.body.assistant.clients,assistantClients,"added");
                    addedClients.forEach(function(addedClient){
                        Client.findByIdAndUpdate(addedClient,{$set:{'assistant.firstName':assistantFirstName,'assistant.lastName':assistantLastName}},function(err,client){
                            if(err){
                                console.log(err);
                            }
                        })
                    })
                    var deletedClients=Functions.arraycmp(req.body.assistant.clients,assistantClients,"deleted");
                    deletedClients.forEach(function(deletedClient){
                        Client.findByIdAndUpdate(deletedClient,{$set:{'assistant.firstName':'','assistant.lastName':''}},function(err,client){
                            if(err){
                                console.log(err);
                            }
                        })
                    })
                    var unchangedClients=Functions.arraycmp(req.body.assistant.clients,assistantClients,"unchanged");
                    unchangedClients.forEach(function(unchangedClient){
                        Client.findByIdAndUpdate(unchangedClient,{$set:{'assistant.firstName':req.body.assistant.firstName,'assistant.lastName':req.body.assistant.lastName}},function(err,client){
                            if(err){
                                console.log(err);
                            }
                        })
                    })
                }
            })
                   
                    res.redirect("/superuser/"+req.params.superuserID+"/assistant/"+req.params.assistantID);
                }
            })
        
    
});


//DELETE ROUTE
router.delete("/:assistantID",Middleware.isLoggedIn,function(req,res){
    Superuser.findByIdAndUpdate(req.params.superuserID,{$pull:{assistants:req.params.assistantID}},function(err,superuser){
        if(err){
            console.log(err);
        }
    });
    Assistant.findById(req.params.assistantID,function(err,assistant){
        if(err){
            console.log(err);
        }
        else{
            assistant.clients.forEach(function(client){
                Client.findByIdAndUpdate(client,{$set:{'assistant.firstName':'','assistant.lastName':''}},function(err){
                    if(err){
                        console.log(err);
                    }
                });
            });
            if(req.body.deleteFlag!="deactivate"){
                Assistant.findByIdAndRemove(req.params.assistantID,function(err){
                    if(err){
                        console.log(err);
                    }
                }); 
            }
            else{
                Assistant.findByIdAndUpdate(req.params.assistantID,{$set:{deactivationSuperuser:req.params.superuserID,clients:[]}},function(err){
                    if(err){
                        console.log(err);
                    }
                }); 
            }
            
        }
    });
    
        res.redirect("/superuser/"+req.params.superuserID+"/assistant");
});


    
    
module.exports=router;
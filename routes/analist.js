//VAR DECLARATION
var express=require("express"),
    router=express.Router({mergeParams:true}),
    //models
    Superuser=require("../models/superuser"),
    Analist=require("../models/analist"),
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
                Analist.findById(req.params.analistID).populate("clients").exec(function(err,analist){
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
                    Analist.findById(req.params.analistID).populate("clients").exec(function(err,analist){
                        if(err){
                            console.log(err);
                        }
                        else{
                            Client.find({'analist.firstName':"",deactivationSuperuser:{ $exists:false}},function(err,clients){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    res.render("analist/edit",{page:"analist-edit",superuser:superuser,analist:analist,clients:clients});
                                }
                            });
                         }
                    });
                }
    });
});

//UPDATE ROUTE
router.put("/:analistID",Middleware.isLoggedIn,function(req,res){
    var analistFirstName;
    var analistLastName;
    var analistClients;
    Analist.findById(req.params.analistID,function(err,analist){
        if(err){
            console.log(err);
        }
        else{
            var analistFirstName=analist.firstName; 
            var analistLastName=analist.lastName;
            var analistClients=analist.clients;
            Analist.findByIdAndUpdate(req.params.analistID,{$set:req.body.analist},function(err){
                if(err){
                    console.log(err);
                }
                else{
                    var addedClients=Functions.arraycmp(req.body.analist.clients,analistClients,"added");
                    addedClients.forEach(function(addedClient){
                        Client.findByIdAndUpdate(addedClient,{$set:{'analist.firstName':analistFirstName,'analist.lastName':analistLastName}},function(err,client){
                            if(err){
                                console.log(err);
                            }
                        })
                    })
                    var deletedClients=Functions.arraycmp(req.body.analist.clients,analistClients,"deleted");
                    deletedClients.forEach(function(deletedClient){
                        Client.findByIdAndUpdate(deletedClient,{$set:{'analist.firstName':'','analist.lastName':''}},function(err,client){
                            if(err){
                                console.log(err);
                            }
                        })
                    })
                    var unchangedClients=Functions.arraycmp(req.body.analist.clients,analistClients,"unchanged");
                    unchangedClients.forEach(function(unchangedClient){
                        Client.findByIdAndUpdate(unchangedClient,{$set:{'analist.firstName':req.body.analist.firstName,'analist.lastName':req.body.analist.lastName}},function(err,client){
                            if(err){
                                console.log(err);
                            }
                        })
                    })
                    
                }
            })
                    res.redirect("/superuser/"+req.params.superuserID+"/analist/"+req.params.analistID);
                }
                    
                
            })
            
        
        
    
    
});

//DELETE ROUTE
router.delete("/:analistID",Middleware.isLoggedIn,function(req,res){
     Superuser.findByIdAndUpdate(req.params.superuserID,{$pull:{analists:req.params.analistID}},function(err,superuser){
        if(err){
            console.log(err);
        }
    });
    Analist.findById(req.params.analistID,function(err,analist){
        if(err){
            console.log(err);
        }
        else{
            analist.clients.forEach(function(client){
                Client.findByIdAndUpdate(client,{$set:{'analist.firstName':'','analist.lastName':''}},function(err){
                    if(err){
                        console.log(err);
                    }
                });
            });
            if(req.body.deleteFlag!="deactivate"){
                Analist.findByIdAndRemove(req.params.analistID,function(err){
                    if(err){
                        console.log(err);
                    }
                }); 
            }
            else{
                Analist.findByIdAndUpdate(req.params.analistID,{$set:{deactivationSuperuser:req.params.superuserID,clients:[]}},function(err){
                    if(err){
                        console.log(err);
                    }
                }); 
            }
            
        }
    });
    
        res.redirect("/superuser/"+req.params.superuserID+"/analist");
});


    
module.exports=router;
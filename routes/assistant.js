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
	Functions=require("../functions"),
	//aws private info
	AWSPrivate=require("../../private/awsPrivate");
//INDEX ROUTE  
router.get("/",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	var regex;
	if(req.query.search){
		regex=new RegExp(Functions.escapeRegex(req.query.search),"gi");
		Superuser.findById(req.user.userRef).populate("assistants",null,{firstName:regex}).exec(function(err,superuser){
			if(err){
				req.flash("error",err.message+", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				res.render("assistant/index",{page:"assistant-index",assistants:superuser.assistants,superuserID:req.user.userRef});
			}
		});
	}
	else{
		Superuser.findById(req.user.userRef).populate("assistants").exec(function(err,superuser){
			if(err){
				req.flash("error",err.message+", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				res.render("assistant/index",{page:"assistant-index",assistants:superuser.assistants,superuserID:req.user.userRef});
			}
		});
	}    
});

//NEW ROUTE
router.get("/new",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Superuser.findById(req.user.userRef,function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			res.render("assistant/new",{page:"assistant-new",superuserID:req.user.userRef});
		}
	});
});

//CREATE ROUTE
router.post("/",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Assistant.create(req.body.assistant,function(err,assistant){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Functions.AWSS3Upload(AWSPrivate.bucket(),AWSPrivate.key(assistant._id),AWSPrivate.filePath(),AWSPrivate.acl());
			assistant.photo=AWSPrivate.uploadedPhotoLocation(assistant._id);
			assistant.save(function(err){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
			});
			Superuser.findById(req.user.userRef,function(err,superuser){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					superuser.assistants.push(assistant);
					superuser.save();
					User.register(new User({username:req.body.username,type:"assistant",company:superuser.company,userRef:assistant._id}),req.body.password,function(err,user){
						if(err){
							req.flash("error",err.message+", please login again to continue");
							req.logout();
							return res.redirect("/login");
						}
						else{
							req.flash("success","Assistant successfully created");
							res.redirect("/superuser/"+req.user.userRef+"/assistant");
						}
                       
					});
				}
			});
		}
	});
});

//SHOW ROUTE
router.get("/:assistantID",Middleware.isLoggedIn,Middleware.isAssistantSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAssistant,function(req,res){
	Superuser.findById(req.params.superuserID,function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Assistant.findById(req.params.assistantID).populate("clients").exec(function(err,assistant){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("assistant/show",{page:"assistant-show",superuserID:req.params.superuserID,assistant:assistant});
				}
			});
               
		}
	}); 
});


//EDIT ROUTES
router.get("/:assistantID/edit",Middleware.isLoggedIn,Middleware.isAssistantSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAssistant,function(req,res){
	Superuser.findById(req.params.superuserID,function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Assistant.findById(req.params.assistantID).populate("clients").exec(function(err,assistant){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					Client.find({"assistant.firstName":"",deactivationSuperuser:{ $exists:false}},function(err,clients){
						if(err){
							req.flash("error",err.message+", please login again to continue");
							req.logout();
							return res.redirect("/login");
						}
						else{
							res.render("assistant/edit",{page:"assistant-edit",superuserID:req.params.superuserID,assistant:assistant,clients:clients});
						}
					});
				}
			});
		}
	});
});

//UPDATE ROUTE
router.put("/:assistantID",Middleware.isLoggedIn,Middleware.isAssistantSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAssistant,Middleware.uploadPhoto.array("photo"),Middleware.fixInputFormat,function(req,res){
    
	Assistant.findById(req.params.assistantID,function(err,assistant){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			var assistantFirstName=assistant.firstName; 
			var assistantLastName=assistant.lastName;
			var assistantClients=assistant.clients;
			assistant.clients=[];
			Assistant.findByIdAndUpdate(req.params.assistantID,req.body.assistant,function(err){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					var addedClients=Functions.arraycmp(req.body.assistant.clients,assistantClients,"added");
					addedClients.forEach(function(addedClient){
						Client.findByIdAndUpdate(addedClient,{$set:{"assistant.firstName":assistantFirstName,"assistant.lastName":assistantLastName}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
					var deletedClients=Functions.arraycmp(req.body.assistant.clients,assistantClients,"deleted");
					deletedClients.forEach(function(deletedClient){
						Client.findByIdAndUpdate(deletedClient,{$set:{"assistant.firstName":"","assistant.lastName":""}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
					var unchangedClients=Functions.arraycmp(req.body.assistant.clients,assistantClients,"unchanged");
					unchangedClients.forEach(function(unchangedClient){
						Client.findByIdAndUpdate(unchangedClient,{$set:{"assistant.firstName":req.body.assistant.firstName,"assistant.lastName":req.body.assistant.lastName}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
				}
			});
			if(req.user.type=="assistant"){
				req.flash("success","Profile successfully updated"); 
			}
			else{
				req.flash("success","Assistant successfully updated");
			}
			res.redirect("/superuser/"+req.params.superuserID+"/assistant/"+req.params.assistantID);
		}
	});
        
    
});


//DELETE ROUTE
router.delete("/:assistantID",Middleware.isLoggedIn,function(req,res){
	Superuser.findByIdAndUpdate(req.user.userRef,{$pull:{assistants:req.params.assistantID}},function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
	});
	User.findOneAndRemove({userRef:req.params.assistantID},function(err){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
	});
	Assistant.findById(req.params.assistantID,function(err,assistant){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			assistant.clients.forEach(function(client){
				Client.findByIdAndUpdate(client,{$set:{"assistant.firstName":"","assistant.lastName":""}},function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
				});
			});
			if(req.body.deleteFlag!="deactivate"){
				Assistant.findByIdAndRemove(req.params.assistantID,function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else{
						req.flash("success","Assistant successfully deleted");
						return res.redirect("/superuser/"+req.user.userRef+"/assistant"); 
					}
				}); 
			}
			else{
				Assistant.findByIdAndUpdate(req.params.assistantID,{$set:{deactivationSuperuser:req.user.userRef,clients:[]}},function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else{
						req.flash("success","Assistant successfully deactivated");
						return res.redirect("/superuser/"+req.user.userRef+"/assistant"); 
					}
				}); 
			}
             
		}
	});
        
});


    
    
module.exports=router;
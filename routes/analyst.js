//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	//models
	Superuser=require("../models/superuser"),
	Analyst=require("../models/analyst"),
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
		Superuser.findById(req.user.userRef).populate("analysts",null,{firstName:regex}).exec(function(err,superuser){
			if(err){
				req.flash("error",err.message+", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				res.render("analyst/index",{page:"analyst-index",analysts:superuser.analysts,superuserID:req.user.userRef});
			}
		});
	}
	else{
		Superuser.findById(req.user.userRef).populate("analysts").exec(function(err,superuser){
			if(err){
				req.flash("error",err.message+", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				res.render("analyst/index",{page:"analyst-index",analysts:superuser.analysts,superuserID:req.user.userRef});
			}
		});
	}    
});

//NEW ROUTE
router.get("/new",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	res.render("analyst/new",{page:"analyst-new",superuserID:req.user.userRef});
});

//CREATE ROUTE
router.post("/",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Analyst.create(req.body.analyst,function(err,analyst){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
            
			Functions.AWSS3Upload(AWSPrivate.bucket(),AWSPrivate.key(analyst._id),AWSPrivate.filePath(),AWSPrivate.acl());
			analyst.photo=AWSPrivate.uploadedPhotoLocation(analyst._id);
			analyst.save(function(err){
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
					superuser.analysts.push(analyst);
					superuser.save();
					User.register(new User({username:req.body.username,type:"analyst",company:superuser.company,userRef:analyst._id}),req.body.password,function(err,user){
						if(err){
							req.flash("error",err.message+", please login again to continue");
							req.logout();
							return res.redirect("/login");
						}
						else{
							req.flash("success","Analyst successfully created");
							res.redirect("/superuser/"+req.user.userRef+"/analyst");
						}
                       
					});
				}
			});
		}
	});
});

//SHOW ROUTE
router.get("/:analystID",Middleware.isLoggedIn,Middleware.isAnalystSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAnalyst,function(req,res){
	Superuser.findById(req.params.superuserID,function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Analyst.findById(req.params.analystID).populate("clients").exec(function(err,analyst){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("analyst/show",{page:"analyst-show",superuserID:req.params.superuserID,analyst:analyst});
				}
			});
               
		}
	}); 
});

//EDIT ROUTE
router.get("/:analystID/edit",Middleware.isLoggedIn,Middleware.isAnalystSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAnalyst,function(req,res){
   
	Analyst.findById(req.params.analystID).populate("clients").exec(function(err,analyst){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Client.find({'analyst.firstName':"",deactivationSuperuser:{ $exists:false}},function(err,clients){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("analyst/edit",{page:"analyst-edit",superuserID:req.params.superuserID,analyst:analyst,clients:clients});
				}
			});
		}
	});
});
//UPDATE ROUTE
router.put("/:analystID",Middleware.isLoggedIn,Middleware.isAnalystSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAnalyst,Middleware.uploadPhoto.array('photo'),Middleware.fixInputFormat,function(req,res){
	Analyst.findById(req.params.analystID,function(err,analyst){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			var analystFirstName=analyst.firstName; 
			var analystLastName=analyst.lastName;
			var analystClients=analyst.clients;
			Analyst.findByIdAndUpdate(req.params.analystID,{$set:req.body.analyst},function(err){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					var addedClients=Functions.arraycmp(req.body.analyst.clients,analystClients,"added");
					addedClients.forEach(function(addedClient){
						Client.findByIdAndUpdate(addedClient,{$set:{'analyst.firstName':analystFirstName,'analyst.lastName':analystLastName}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
					var deletedClients=Functions.arraycmp(req.body.analyst.clients,analystClients,"deleted");
					deletedClients.forEach(function(deletedClient){
						Client.findByIdAndUpdate(deletedClient,{$set:{'analyst.firstName':'','analyst.lastName':''}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
					var unchangedClients=Functions.arraycmp(req.body.analyst.clients,analystClients,"unchanged");
					unchangedClients.forEach(function(unchangedClient){
						Client.findByIdAndUpdate(unchangedClient,{$set:{'analyst.firstName':req.body.analyst.firstName,'analyst.lastName':req.body.analyst.lastName}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
                    
				}
			});      
			if(req.user.type=="analyst"){
				req.flash("success","Profile successfully updated"); 
			}
			else{
				req.flash("success","Analyst successfully updated");
			}
			res.redirect("/superuser/"+req.params.superuserID+"/analyst/"+req.params.analystID);
		}
                    
	});
});

//DELETE ROUTE
router.delete("/:analystID",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Superuser.findByIdAndUpdate(req.user.userRef,{$pull:{analysts:req.params.analystID}},function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
	});
	User.findOneAndRemove({userRef:req.params.analystID},function(err){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
	});
	Analyst.findById(req.params.analystID,function(err,analyst){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			analyst.clients.forEach(function(client){
				Client.findByIdAndUpdate(client,{$set:{'analyst.firstName':'','analyst.lastName':''}},function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
				});
			});
			if(req.body.deleteFlag!="deactivate"){
				Analyst.findByIdAndRemove(req.params.analystID,function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else{
						req.flash("success","Analyst successfully deleted");
						return res.redirect("/superuser/"+req.user.userRef+"/analyst"); 
					}
				}); 
			}
			else{
                
				Analyst.findByIdAndUpdate(req.params.analystID,{$set:{deactivationSuperuser:req.user.userRef,clients:[]}},function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else{
						req.flash("success","Analyst successfully deactivated");
						return res.redirect("/superuser/"+req.user.userRef+"/analyst"); 
					}
				}); 
			}
            
		}
	});
        
});


    
module.exports=router;
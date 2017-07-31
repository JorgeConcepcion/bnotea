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
	Functions=require("../functions"),
	//aws private info
	AWSPrivate=require("../private/awsPrivate");

//INDEX ROUTE 
router.get("/",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	var regex;
	if(req.query.search){
		regex=new RegExp(Functions.escapeRegex(req.query.search),"gi");
		Superuser.findById(req.user.userRef).populate("analists",null,{firstName:regex}).exec(function(err,superuser){
			if(err){
				req.flash("error",err.message+", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				res.render("analist/index",{page:"analist-index",analists:superuser.analists,superuserID:req.user.userRef});
			}
		});
	}
	else{
		Superuser.findById(req.user.userRef).populate("analists").exec(function(err,superuser){
			if(err){
				req.flash("error",err.message+", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				res.render("analist/index",{page:"analist-index",analists:superuser.analists,superuserID:req.user.userRef});
			}
		});
	}    
});

//NEW ROUTE
router.get("/new",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	res.render("analist/new",{page:"analist-new",superuserID:req.user.userRef});
});

//CREATE ROUTE
router.post("/",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Analist.create(req.body.analist,function(err,analist){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
            
			Functions.AWSS3Upload(AWSPrivate.bucket(),AWSPrivate.key(analist._id),AWSPrivate.filePath(),AWSPrivate.acl());
			analist.photo=AWSPrivate.uploadedPhotoLocation(analist._id);
			analist.save(function(err){
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
					superuser.analists.push(analist);
					superuser.save();
					User.register(new User({username:req.body.username,type:"analist",company:superuser.company,userRef:analist._id}),req.body.password,function(err,user){
						if(err){
							req.flash("error",err.message+", please login again to continue");
							req.logout();
							return res.redirect("/login");
						}
						else{
							req.flash("success","Analist successfully created");
							res.redirect("/superuser/"+req.user.userRef+"/analist");
						}
                       
					});
				}
			});
		}
	});
});

//SHOW ROUTE
router.get("/:analistID",Middleware.isLoggedIn,Middleware.isAnalistSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAnalist,function(req,res){
	Superuser.findById(req.params.superuserID,function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Analist.findById(req.params.analistID).populate("clients").exec(function(err,analist){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("analist/show",{page:"analist-show",superuserID:req.params.superuserID,analist:analist});
				}
			});
               
		}
	}); 
});

//EDIT ROUTE
router.get("/:analistID/edit",Middleware.isLoggedIn,Middleware.isAnalistSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAnalist,function(req,res){
   
	Analist.findById(req.params.analistID).populate("clients").exec(function(err,analist){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Client.find({'analist.firstName':"",deactivationSuperuser:{ $exists:false}},function(err,clients){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("analist/edit",{page:"analist-edit",superuserID:req.params.superuserID,analist:analist,clients:clients});
				}
			});
		}
	});
});
//UPDATE ROUTE
router.put("/:analistID",Middleware.isLoggedIn,Middleware.isAnalistSuperuser,Middleware.isAuthorizedSuperuser,Middleware.isAuthorizedAnalist,Middleware.uploadPhoto.array('photo'),Middleware.fixInputFormat,function(req,res){
	Analist.findById(req.params.analistID,function(err,analist){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			var analistFirstName=analist.firstName; 
			var analistLastName=analist.lastName;
			var analistClients=analist.clients;
			Analist.findByIdAndUpdate(req.params.analistID,{$set:req.body.analist},function(err){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					var addedClients=Functions.arraycmp(req.body.analist.clients,analistClients,"added");
					addedClients.forEach(function(addedClient){
						Client.findByIdAndUpdate(addedClient,{$set:{'analist.firstName':analistFirstName,'analist.lastName':analistLastName}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
					var deletedClients=Functions.arraycmp(req.body.analist.clients,analistClients,"deleted");
					deletedClients.forEach(function(deletedClient){
						Client.findByIdAndUpdate(deletedClient,{$set:{'analist.firstName':'','analist.lastName':''}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
					var unchangedClients=Functions.arraycmp(req.body.analist.clients,analistClients,"unchanged");
					unchangedClients.forEach(function(unchangedClient){
						Client.findByIdAndUpdate(unchangedClient,{$set:{'analist.firstName':req.body.analist.firstName,'analist.lastName':req.body.analist.lastName}},function(err,client){
							if(err){
								req.flash("error",err.message+", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
					});
                    
				}
			});      
			if(req.user.type=="analist"){
				req.flash("success","Profile successfully updated"); 
			}
			else{
				req.flash("success","Analist successfully updated");
			}
			res.redirect("/superuser/"+req.params.superuserID+"/analist/"+req.params.analistID);
		}
                    
	});
});

//DELETE ROUTE
router.delete("/:analistID",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Superuser.findByIdAndUpdate(req.user.userRef,{$pull:{analists:req.params.analistID}},function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
	});
	User.findOneAndRemove({userRef:req.params.analistID},function(err){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
	});
	Analist.findById(req.params.analistID,function(err,analist){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			analist.clients.forEach(function(client){
				Client.findByIdAndUpdate(client,{$set:{'analist.firstName':'','analist.lastName':''}},function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
				});
			});
			if(req.body.deleteFlag!="deactivate"){
				Analist.findByIdAndRemove(req.params.analistID,function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else{
						req.flash("success","Analist successfully deleted");
						return res.redirect("/superuser/"+req.user.userRef+"/analist"); 
					}
				}); 
			}
			else{
                
				Analist.findByIdAndUpdate(req.params.analistID,{$set:{deactivationSuperuser:req.user.userRef,clients:[]}},function(err){
					if(err){
						req.flash("error",err.message+", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else{
						req.flash("success","Analist successfully deactivated");
						return res.redirect("/superuser/"+req.user.userRef+"/analist"); 
					}
				}); 
			}
            
		}
	});
        
});


    
module.exports=router;
//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	//models
	Superuser=require("../models/superuser"),
	Client=require("../models/client"),
	Assistant=require("../models/assistant"),
	Analyst=require("../models/analyst"),
	Log=require("../models/log"),
	//middleware
	Middleware=require("../middleware"),
	//functions
	Functions=require("../functions"),
	//aws private info
	AWSPrivate=require("../../private/awsPrivate");
    
//INDEX ROUTE
router.get("/",Middleware.isLoggedIn,Middleware.isAuthorizedAssistant,Middleware.isAuthorizedAnalyst,Middleware.isAuthorizedSuperuser,function(req,res){
	var regex;
	if(req.user.type=="superuser"){
		if(req.query.search){
			regex=new RegExp(Functions.escapeRegex(req.query.search),"gi");
			Superuser.findById(req.user.userRef).populate("clients",null,{firstName:regex}).exec(function(err,superuser){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("client/index",{page:"client-index",clients:superuser.clients,superuserID:req.params.superuserID});
				}
			});
		}
		else{
			Superuser.findById(req.user.userRef).populate("clients").exec(function(err,superuser){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("client/index",{page:"client-index",clients:superuser.clients,superuserID:req.params.superuserID});
				}
			});
		}  
	}
	if(req.user.type=="analyst"){
		if(req.query.search){
			regex=new RegExp(Functions.escapeRegex(req.query.search),"gi");
			Analyst.findById(req.user.userRef).populate("clients",null,{firstName:regex}).exec(function(err,analyst){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("client/index",{page:"client-index",clients:analyst.clients,superuserID:req.params.superuserID});
				}
			});
		}
		else{
			Analyst.findById(req.user.userRef).populate("clients").exec(function(err,analyst){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("client/index",{page:"client-index",clients:analyst.clients,superuserID:req.params.superuserID});
				}
			});
		}  
	}
	if(req.user.type=="assistant"){
		if(req.query.search){
			regex=new RegExp(Functions.escapeRegex(req.query.search),"gi");
			Assistant.findById(req.user.userRef).populate("clients",null,{firstName:regex}).exec(function(err,assistant){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("client/index",{page:"client-index",clients:assistant.clients,superuserID:req.params.superuserID});
				}
			});
		}
		else{
			Assistant.findById(req.user.userRef).populate("clients").exec(function(err,assistant){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("client/index",{page:"client-index",clients:assistant.clients,superuserID:req.params.superuserID});
				}
			});
		}  
	}
       
});

//NEW ROUTE
router.get("/new",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Superuser.findById(req.params.superuserID,function(err){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			res.render("client/new",{page:"client-new",superuserID:req.params.superuserID});
		}
	});
});

//CREATE ROUTE
router.post("/",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Client.create(req.body.client,function(err,client){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Functions.AWSS3Upload(AWSPrivate.bucket(),AWSPrivate.key(client._id),AWSPrivate.filePath(),AWSPrivate.acl());
			client.photo=AWSPrivate.uploadedPhotoLocation(client._id);
			client.save(function(err){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
			});
			Superuser.findById(req.params.superuserID,function(err,superuser){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					superuser.clients.push(client);
					superuser.save();
					let info="created client id: "+client._id;
					Log.create({info:info,code:"CREATECLIENT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
					req.flash("success","Client successfully created");
					res.redirect("/superuser/"+superuser._id+"/client");
				}
			});
		}
	});
});

//SHOW ROUTE
router.get("/:clientID",Middleware.isLoggedIn,Middleware.isAuthorizedAssistant,Middleware.isAuthorizedAnalyst,Middleware.isAuthorizedSuperuser,function(req,res){
	Superuser.findById(req.params.superuserID,function(err){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Client.findById(req.params.clientID,function(err,client){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("client/show",{page:"client-show",superuserID:req.params.superuserID,client:client});
				}
			});
		}
	});
});

//EDIT ROUTE
router.get("/:clientID/edit",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Superuser.findById(req.params.superuserID,function(err,superuser){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Client.findById(req.params.clientID,function(err,client){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					res.render("client/edit",{page:"client-edit",superuserID:req.params.superuserID,client:client});
				}
			});
		}
	});
});

//UPDATE ROUTE
router.put("/:clientID",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,Middleware.uploadPhoto.array("photo"),Middleware.fixInputFormat,function(req,res){
	Client.findByIdAndUpdate(req.params.clientID,{$set:req.body.client},function(err){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			let info="created client id: "+req.params.clientID;
			Log.create({info:info,code:"UPDATECLIENT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
			req.flash("success","Client successfully updated");
			res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID);
		}
        
	});
});

//DELETE ROUTE
router.delete("/:clientID",Middleware.isLoggedIn,Middleware.isSuperuser,Middleware.isAuthorizedSuperuser,function(req,res){
	Assistant.findOneAndUpdate({clients:req.params.clientID},{$pull:{clients:req.params.clientID}},function(err,assistant){
		if(err){
			req.flash("error",err.message+", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Analyst.findOneAndUpdate({clients:req.params.clientID},{$pull:{clients:req.params.clientID}},function(err,analyst){
				if(err){
					req.flash("error",err.message+", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					Superuser.findByIdAndUpdate(req.params.superuserID,{$pull:{clients:req.params.clientID}},function(err,superuser){
						if(err){
							req.flash("error",err.message+", please login again to continue");
							req.logout();
							return res.redirect("/login");
						}
						else{
							if(req.body.deleteFlag!="deactivate"){
								Client.findByIdAndRemove(req.params.clientID,function(err){
									if(err){
										req.flash("error",err.message+", please login again to continue");
										req.logout();
										return res.redirect("/login");
									}
									else{
										let info="deleted client id: "+req.params.clientID;
										Log.create({info:info,code:"DELETECLIENT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
										req.flash("success","Client successfully deleted");
										return res.redirect("/superuser/"+req.params.superuserID+"/client");
									}
                
								}); 
							}
							else{
								Client.findByIdAndUpdate(req.params.clientID,{$set:{deactivationSuperuser:req.params.superuserID}},function(err,client){
									if(err){
										req.flash("error",err.message+", please login again to continue");
										req.logout();
										return res.redirect("/login");
									}
									else{
										let info="deactivated client id: "+req.params.clientID;
										Log.create({info:info,code:"DEACTIVATECLIENT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
										req.flash("success","Client successfully deactivated" );
										return res.redirect("/superuser/"+req.params.superuserID+"/client");
									}
                
								}); 
							}
        
						}
					});
				}
			});
		}
	});
    
});




module.exports=router;
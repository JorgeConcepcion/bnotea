//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	moment=require("moment"),
	Client=require("../models/client"),
	Assistant=require("../models/assistant"),
	Analist=require("../models/analist"),
	Report=require("../models/report");

//NEW ROUTE
router.get("/new",function(req,res){
	let times=[];
	for(let i=0;i<3;i++){
		times.push(moment(Date.now()).subtract(moment(Date.now()).format("d"),"days").subtract(i*7,"days").format("MM/DD/YYYY"));  
	}
	res.render("report/new",{page:"report-new",superuserID:req.params.superuserID,clientID:req.params.clientID,times:times});
});

//INDEX ROUTE
router.get("/",function(req,res){
	res.render("report/index",{page:"report-index",superuserID:req.params.superuserID,clientID:req.params.clientID});
});

//CREATE ROUTE
router.post("/",function(req,res){
	Report.create(req.body.report,function(err,report){
		if(err){
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			
			Client.findById(req.params.clientID,function(err,client){
				if(err){
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					if(req.user.type=="analist"){
						client.analistReports.push(report);
						client.save(function(err){
							if(err){
								req.flash("error", err.message + ", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
						Analist.findById(req.user.userRef,function(err,analist){
							if(err){
								req.flash("error", err.message + ", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
							else{
								analist.reports.push(report);
								analist.save(function(err){
									if(err){
										req.flash("error", err.message + ", please login again to continue");
										req.logout();
										return res.redirect("/login");
									}
									else{
										req.flash("success","Report successfully created");
										res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
									}
								});
							}
						});
					}
					else if(req.user.type=="assistant"){
						client.assistantReports.push(report);
						client.save(function(err){
							if(err){
								req.flash("error", err.message + ", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
						});
						Assistant.findById(req.user.userRef,function(err,assistant){
							if(err){
								req.flash("error", err.message + ", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
							else{
								assistant.reports.push(report);
								assistant.save(function(err){
									if(err){
										req.flash("error", err.message + ", please login again to continue");
										req.logout();
										return res.redirect("/login");
									}
									else{
										req.flash("success","Report successfully created");
										res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
									}
								});
							}
						});
					}
				}
			});
			
		}
	});
});

module.exports = router;
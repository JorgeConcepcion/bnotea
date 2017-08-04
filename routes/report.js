//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	moment=require("moment"),
	Client=require("../models/client"),
	Assistant=require("../models/assistant"),
	Analist=require("../models/analist"),
	Report=require("../models/report"),
	Middleware=require("../middleware");
//NEW ROUTE
router.get("/new",function(req,res){
	var author;
	let times=[];
	for(let i=0;i<4;i++){
		times.push(moment(Date.now()).subtract(moment(Date.now()).format("d"),"days").subtract(i*7,"days").format("MM/DD/YYYY"));  
	}
	if(req.user.type=="analist"){
		Client.findById(req.params.clientID).populate({path:"analistReports",match:{startDate:{$in:[times[0],times[1],times[2],times[3]]}},select:"startDate -_id"}).exec(function(err,client){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				var goodTimes=[];
				times.forEach(function(time){
					let flag=false;
					client.analistReports.forEach(function(report){
						if(time==report.startDate){
							flag=true;
						}
					});
					if(!flag){
						goodTimes.push(time);
					}
				});
				author=client.analist.firstName+" "+client.analist.lastName;
				return res.render("report/new",{page:"report-new",superuserID:req.params.superuserID,clientID:req.params.clientID,times:goodTimes,author:author});
			}
		});
	}
	else if(req.user.type=="assistant"){
		Client.findById(req.params.clientID).populate({path:"assistantReports",match:{startDate:{$in:[times[0],times[1],times[2],times[3]]}},select:"startDate -_id"}).exec(function(err,client){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				var goodTimes=[];
				times.forEach(function(time){
					let flag=false;
					client.assistantReports.forEach(function(report){
						if(time==report.startDate){
							flag=true;
						}
					});
					if(!flag){
						goodTimes.push(time);
					}
				});
				author=client.assistant.firstName+" "+client.assistant.lastName;
				return res.render("report/new",{page:"report-new",superuserID:req.params.superuserID,clientID:req.params.clientID,times:goodTimes,author:author});
			}
		});
	}
});

//INDEX ROUTE
router.get("/",function(req,res){
	var assistantStates=[];
	var assistantUnits=[];
	var analistStates=[];
	var analistUnits=[];
	Client.findById(req.params.clientID).populate("assistantReports").populate("analistReports").exec(function(err,client){
		if(err){
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			client.assistantReports.forEach(function(report){
				if(report.assistantLog.state=="Started" || report.behavior.state=="Started" 
				|| report.replacement.state=="Started" || report.supervision.state=="Started"   
				|| report.medical.state=="Started" ){
					assistantStates.push("Started");
				}
				else if(report.assistantLog.state=="On revision" || report.behavior.state=="On revision" 
				|| report.replacement.state=="On revision" || report.supervision.state=="On revision"   
				|| report.medical.state=="On revision" ){
					assistantStates.push("On revision");
				}
				else if(report.assistantLog.state=="Completed" || report.behavior.state=="Completed" 
				|| report.replacement.state=="Completed" || report.supervision.state=="Completed"   
				|| report.medical.state=="Completed" ){
					assistantStates.push("Completed");
				}
				var unit=0;
				report.schedule.forEach(function(day){
					if(day.timeIn && day.timeIn.length>0){
						let hoursIn=Number(day.timeIn.split(":")[0]);
						let minIn=Number(day.timeIn.split(":")[1]);
						let hoursOut=Number(day.timeOut.split(":")[0]);
						let minOut=Number(day.timeOut.split(":")[1]);
						unit=unit+(hoursOut-hoursIn)*4+(minOut-minIn)/15;
					}
				});
				assistantUnits.push(unit);
			});		
			client.analistReports.forEach(function(report){
				if(report.analistLog.state=="Started" || report.caregiver.state=="Started"){
					analistStates.push("Started");
				}
				else if(report.analistLog.state=="On revision" || report.caregiver.state=="On revision"){
					analistStates.push("On revision");
				}
				else if(report.analistLog.state=="Completed" || report.caregiver.state=="Completed"){
					analistStates.push("Completed");
				}
				var unit=0;
				report.schedule.forEach(function(day){
					if(day.timeIn && day.timeIn.length>0){
						let hoursIn=Number(day.timeIn.split(":")[0]);
						let minIn=Number(day.timeIn.split(":")[1]);
						let hoursOut=Number(day.timeOut.split(":")[0]);
						let minOut=Number(day.timeOut.split(":")[1]);
						unit=unit+(hoursOut-hoursIn)*4+(minOut-minIn)/15;
					}
				});
				analistUnits.push(unit);
			});		
			return res.render("report/index",{page:"report-index",superuserID:req.params.superuserID,client:client,assistantStates:assistantStates,assistantUnits:assistantUnits,analistStates:analistStates,analistUnits:analistUnits});
		}
	});
});

//CREATE ROUTE
router.post("/",Middleware.checkSchedule,Middleware.checkOwnSchedule,function(req,res){
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
						report.analistLog.state="Started";
						report.caregiver.state="Started";
						report.save(function(err,report){
							if(err){
								req.flash("error", err.message + ", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
							else{
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
												return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
											}
										});
									}
								});
							}
						});
					}
					else if(req.user.type=="assistant"){
						report.assistantLog.state="Started";
						report.behavior.state="Started";
						report.replacement.state="Started";
						report.medical.state="Started";
						report.supervision.state="Started";
						report.save(function(err,report){
							if(err){
								req.flash("error", err.message + ", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
							else{
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
												return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
											}
										});
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
//SHOW ROUTE
router.get("/:reportID",function(req,res){
	Report.findById(req.params.reportID,function(err,report){
		if(err){
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}else{
			res.send(report);
		}
		
	});
});
module.exports = router;
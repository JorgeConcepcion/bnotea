//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	moment=require("moment"),
	Superuser=require("../models/superuser"),
	Client=require("../models/client"),
	Assistant=require("../models/assistant"),
	Analist=require("../models/analist"),
	Report=require("../models/report"),
	Middleware=require("../middleware"),
	Functions=require("../functions");
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
	Client.findById(req.params.clientID).populate({path:"assistantReports",options: { sort: { startDate: -1 }}}).populate({path:"analistReports",options: { sort: { startDate: -1 }}}).exec(function(err,client){
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
						report=Functions.initializeAnalistReport(report,client);
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
						report=Functions.initializeAssistantReport(report,client);
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

//EDIT ROUTE
router.get("/:reportID/edit",function(req,res){
	var unit=0;
	var units=[];
	var hours="";
	Report.findById(req.params.reportID,function(err,report){
		if(err){
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			report.schedule.forEach(function(day){
				if(day.timeIn && day.timeIn.length>0){
					let hoursIn=Number(day.timeIn.split(":")[0]);
					let minIn=Number(day.timeIn.split(":")[1]);
					let hoursOut=Number(day.timeOut.split(":")[0]);
					let minOut=Number(day.timeOut.split(":")[1]);
					let uday=(hoursOut-hoursIn)*4+(minOut-minIn)/15;
					unit=unit+uday;
					units.push(uday);
				}
				else{
					units.push(0);
				}
			});
			hours=Math.floor((unit/4)).toString()+" h "+((unit%4)*15).toString()+" m ";
			Client.findById(req.params.clientID,function(err,client){
				if(err){
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					Superuser.findById(req.params.superuserID,function(err,superuser){
						if(err){
							req.flash("error", err.message + ", please login again to continue");
							req.logout();
							return res.redirect("/login");
						}
						else{
							Analist.findOne({clients:req.params.clientID},function(err,analist){
								if(err){
									req.flash("error", err.message + ", please login again to continue");
									req.logout();
									return res.redirect("/login");
								}
								else{
									Assistant.findOne({clients:req.params.clientID},function(err,assistant){
										if(err){
											req.flash("error", err.message + ", please login again to continue");
											req.logout();
											return res.redirect("/login");
										}
										else{
											if(req.query.section=="schedule"){
												return res.render("report/edit/schedule",{page:"report-edit",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report});
											}
											else if(req.query.section=="assistantLog"){
												return res.render("report/edit/assistantLog",{page:"assistantLog-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analist:analist,unit:unit,units:units,hours:hours});
											}
											else if(req.query.section=="behavior"){
												let frequency=0;
												report.behavior[req.query.behavior].frequency.forEach(function(f){
													frequency=frequency+Number(f);
												});
												return res.render("report/edit/behavior",{page:"behavior-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analist:analist,behavior:req.query.behavior,frequency:frequency});
											}
											else if(req.query.section=="replacement"){
												var trials=0;
												var completed=0;
												var porcentage=0;
												report.replacement[req.query.replacement].trials.forEach(function(t){
													trials=trials+Number(t);
												});
												report.replacement[req.query.replacement].completion.forEach(function(day){
													day.forEach(function(d){
														if(d=="1"){
															completed=completed+1;
														}
													});
											
												});
												if(trials!=0){
													porcentage = Math.round((completed / trials) * 10000) / 100;
												}
												return res.render("report/edit/replacement",{page:"replacement-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analist:analist,replacement:req.query.replacement,trials:trials,completed:completed,porcentage:porcentage});
											}
											else if(req.query.section=="medical"){
												return res.render("report/edit/medical",{page:"medical-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analist:analist});
											}
											else if(req.query.section=="supervision"){
												return res.render("report/edit/supervision",{page:"supervision-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analist:analist});
											}
											else if(req.query.section=="analistLog"){
												return res.render("report/edit/analistLog",{page:"analistLog-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,analist:analist,unit:unit,units:units,hours:hours});
											}
											else if(req.query.section=="caregiver"){
												return res.render("report/edit/caregiver",{page:"caregiver-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,analist:analist});
											}
										}
									});
								}
							});
						}
					});
					
				}
		
			});
		}
	});
});
//UPDATE ROUTE
router.put("/:reportID",Middleware.checkSchedule,Middleware.checkOwnSchedule,function(req,res){
	if(req.body.report.behavior){
		Report.update({_id:req.params.reportID,"behavior.name":req.body.report.behavior.name},{$set:{"behavior.$":req.body.report.behavior}},function(err,report){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				req.flash("success","Report successfully updated");
				return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
			
			}
		});
	}
	else if(req.body.report.replacement){
		Report.update({_id:req.params.reportID,"replacement.name":req.body.report.replacement.name},{$set:{"replacement.$":req.body.report.replacement}},function(err,report){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				req.flash("success","Report successfully updated");
				return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
			
			}
		});
	}
	else{
		Report.findByIdAndUpdate(req.params.reportID,req.body.report,function(err){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				req.flash("success","Report successfully updated");
				return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
			
			}
		});
	}

});
//SHOW ROUTE
router.get("/:reportID",function(req,res){
	Report.findById(req.params.reportID,function(err,report){
		if(err){
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}else{
			var units=[];
			report.schedule.forEach(function(day){
				if(day.timeIn && day.timeIn.length>0){
					let hoursIn=Number(day.timeIn.split(":")[0]);
					let minIn=Number(day.timeIn.split(":")[1]);
					let hoursOut=Number(day.timeOut.split(":")[0]);
					let minOut=Number(day.timeOut.split(":")[1]);
					let unit=(hoursOut-hoursIn)*4+(minOut-minIn)/15;
					units.push(unit);
				}
				else{
					units.push(0);
				}
			});
			return res.render("report/show",{page:"report-show",superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,units:units});
		}
		
	});
});
module.exports = router;
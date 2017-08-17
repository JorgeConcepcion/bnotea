//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	moment=require("moment"),
	Superuser=require("../models/superuser"),
	Log=require("../models/log"),
	Client=require("../models/client"),
	Assistant=require("../models/assistant"),
	Analyst=require("../models/analyst"),
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
	if(req.user.type=="analyst"){
		Client.findById(req.params.clientID).populate({path:"analystReports",match:{startDate:{$in:[times[0],times[1],times[2],times[3]]}},select:"startDate -_id"}).exec(function(err,client){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				var goodTimes=[];
				times.forEach(function(time){
					let flag=false;
					client.analystReports.forEach(function(report){
						if(time==report.startDate){
							flag=true;
						}
					});
					if(!flag){
						goodTimes.push(time);
					}
				});
				author=client.analyst.firstName+" "+client.analyst.lastName;
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
	var analystStates=[];
	var analystUnits=[];
	Client.findById(req.params.clientID).populate({path:"assistantReports",options: { sort: { startDate: -1 }}}).populate({path:"analystReports",options: { sort: { startDate: -1 }}}).exec(function(err,client){
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
				else if(report.assistantLog.state=="Accepted" || report.behavior.state=="Accepted" 
				|| report.replacement.state=="Accepted" || report.supervision.state=="Accepted"   
				|| report.medical.state=="Accepted" ){
					assistantStates.push("Accepted");
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
			client.analystReports.forEach(function(report){
				if(report.analystLog.state=="Started" || report.caregiver.state=="Started"){
					analystStates.push("Started");
				}
				else if(report.analystLog.state=="On revision" || report.caregiver.state=="On revision"){
					analystStates.push("On revision");
				}
				else if(report.analystLog.state=="Completed" || report.caregiver.state=="Completed"){
					analystStates.push("Completed");
				}
				else if(report.analystLog.state=="Accepted" || report.caregiver.state=="Accepted"){
					analystStates.push("Accepted");
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
				analystUnits.push(unit);
			});		
			return res.render("report/index",{page:"report-index",superuserID:req.params.superuserID,client:client,assistantStates:assistantStates,assistantUnits:assistantUnits,analystStates:analystStates,analystUnits:analystUnits});
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
					if(req.user.type=="analyst"){
						Analyst.findById(req.user.userRef,function(err,analyst){
							if(err){
								req.flash("error", err.message + ", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
							else{
								report=Functions.initializeAnalystReport(report,client,analyst);
								report.save(function(err,report){
									if(err){
										req.flash("error", err.message + ", please login again to continue");
										req.logout();
										return res.redirect("/login");
									}
									else{
										client.analystReports.push(report);
										client.save(function(err){
											if(err){
												req.flash("error", err.message + ", please login again to continue");
												req.logout();
												return res.redirect("/login");
											}
										});
										Analyst.findById(req.user.userRef,function(err,analyst){
											if(err){
												req.flash("error", err.message + ", please login again to continue");
												req.logout();
												return res.redirect("/login");
											}
											else{
												analyst.reports.push(report);
												analyst.save(function(err){
													if(err){
														req.flash("error", err.message + ", please login again to continue");
														req.logout();
														return res.redirect("/login");
													}
													else{
														let info="client: "+req.params.clientID+", report "+report._id;
														Log.create({info:info,code:"ANALYSTCREATEREPORT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
														req.flash("success","Report successfully created");
														return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
													}
												});
											}
										});
									}
								});
							}
						});
						
					}
					else if(req.user.type=="assistant"){
						Assistant.findById(req.user.userRef,function(err,assistant){
							if(err){
								req.flash("error", err.message + ", please login again to continue");
								req.logout();
								return res.redirect("/login");
							}
							else{
								report=Functions.initializeAssistantReport(report,client,assistant);
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
														let info="client: "+req.params.clientID+", report "+report._id;
														Log.create({info:info,code:"ASSISTANTCREATEREPORT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
														req.flash("success","Report successfully created");
														return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
													}
												});
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
							Analyst.findOne({clients:req.params.clientID},function(err,analyst){
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
												return res.render("report/edit/assistantLog",{page:"assistantLog-edit-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analyst:analyst,unit:unit,units:units,hours:hours});
											}
											else if(req.query.section=="behavior"){
												let frequency=0;
												report.behavior[req.query.behavior].frequency.forEach(function(f){
													frequency=frequency+Number(f);
												});
												return res.render("report/edit/behavior",{page:"behavior-edit-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analyst:analyst,behavior:req.query.behavior,frequency:frequency});
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
												return res.render("report/edit/replacement",{page:"replacement-edit-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analyst:analyst,replacement:req.query.replacement,trials:trials,completed:completed,porcentage:porcentage});
											}
											else if(req.query.section=="medical"){
												return res.render("report/edit/medical",{page:"medical-edit-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analyst:analyst});
											}
											else if(req.query.section=="supervision"){
												return res.render("report/edit/supervision",{page:"supervision-edit-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,assistant:assistant,analyst:analyst});
											}
											else if(req.query.section=="analystLog"){
												return res.render("report/edit/analystLog",{page:"analystLog-edit-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,analyst:analyst,unit:unit,units:units,hours:hours});
											}
											else if(req.query.section=="caregiver"){
												return res.render("report/edit/caregiver",{page:"caregiver-edit-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,client:client,analyst:analyst});
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
		
		Report.update({_id:req.params.reportID,"behavior.name":req.body.report.behavior.name},{$set:{"behavior.$":req.body.report.behavior}},function(err){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				let info="client: "+req.params.clientID+", report "+req.params.reportID;
				Log.create({info:info,code:"ASSISTANTBEHAVIORUPDATEREPORT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
				req.flash("success","Report successfully updated");
				return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
			
			}
		});
	}
	else if(req.body.report.replacement){
		Report.update({_id:req.params.reportID,"replacement.name":req.body.report.replacement.name},{$set:{"replacement.$":req.body.report.replacement}},function(err){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				let info="client: "+req.params.clientID+", report "+req.params.reportID;
				Log.create({info:info,code:"ASSISTANTREPLACEMENTUPDATEREPORT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
				req.flash("success","Report successfully updated");
				return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
			
			}
		});
	}
	else{
		Report.findByIdAndUpdate(req.params.reportID,req.body.report,function(err,report){
			if(err){
				req.flash("error", err.message + ", please login again to continue");
				req.logout();
				return res.redirect("/login");
			}
			else{
				if(req.body.report.schedule){
					
					if(req.user.type=="assistant"){
						let info="client: "+req.params.clientID+", report "+req.params.reportID;
						Log.create({info:info,code:"SCHEDULEASSISTANTUPDATEREPORT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
						report.assistantLog.state="Started";
						report.replacement.forEach(function(b){
							b.state="Started";
						});
					}
					else if(req.user.type=="analyst"){
						let info="client: "+req.params.clientID+", report "+req.params.reportID;
						Log.create({info:info,code:"SCHEDULEANALYSTUPDATEREPORT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
						report.analystLog.state="Started";
						report.caregiver.state="Started";
						report.caregiver.date="";
					}
					report.save(function(err){
						if(err){
							req.flash("error", err.message + ", please login again to continue");
							req.logout();
							return res.redirect("/login");
						}
					});
				}
				else{
					if(req.user.type=="analyst"){
						let info="client: "+req.params.clientID+", report "+req.params.reportID;
						Log.create({info:info,code:"ANALYSTUPDATEREPORT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
					}
					else if(req.user.type=="assistant"){
						let info="client: "+req.params.clientID+", report "+req.params.reportID;
						Log.create({info:info,code:"ASSISTANTUPDATEREPORT",user:req.user.username,timeStamp:moment(Date.now()).format("MM/DD/YYYY, h:mm:ss a")},function(){});
					}
				}
				
				req.flash("success","Report successfully updated");
				return res.redirect("/superuser/"+req.params.superuserID+"/client/"+req.params.clientID+"/report");
			
			}
		});
	}

});
//SHOW ROUTE
router.get("/:reportID/show",function(req,res){
	var units=[];
	var unit=0;
	Superuser.findById(req.params.superuserID,function(err,superuser){
		if(err){
			req.flash("error", err.message + ", please login again to continue");
			req.logout();
			return res.redirect("/login");
		}
		else{
			Report.findById(req.params.reportID,function(err,report){
				if(err){
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}else{
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
		    var hours=Math.floor((unit/4)).toString()+" h "+((unit%4)*15).toString()+" m ";

					if(req.query.section=="schedule"){
						return res.render("report/show/schedule",{page:"report-show-edit",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,units:units});
					}
					else if(req.query.section=="assistantLog"){
						return res.render("report/show/assistantLog",{page:"assistantLog-show-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,unit:unit,units:units,hours:hours});
					}
					else if(req.query.section=="behavior"){
						let frequency=0;
						report.behavior[req.query.behavior].frequency.forEach(function(f){
							frequency=frequency+Number(f);
						});
						return res.render("report/show/behavior",{page:"behavior-show-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,behavior:req.query.behavior,frequency:frequency});
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
						return res.render("report/show/replacement",{page:"replacement-show-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,replacement:req.query.replacement,trials:trials,completed:completed,porcentage:porcentage});
					}
					else if(req.query.section=="medical"){
						return res.render("report/show/medical",{page:"medical-show-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report});
					}
					else if(req.query.section=="supervision"){
						return res.render("report/show/supervision",{page:"supervision-show-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report});
					}
					else if(req.query.section=="analystLog"){
						return res.render("report/show/analystLog",{page:"analystLog-show-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,unit:unit,units:units,hours:hours});
					}
					else if(req.query.section=="caregiver"){
						return res.render("report/show/caregiver",{page:"caregiver-show-section",superuser:superuser,superuserID:req.params.superuserID,clientID:req.params.clientID,report:report,});
					}
				}
		
			});
		}
	});
});
module.exports = router;
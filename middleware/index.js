var midlewareObj = {};
var Superuser = require("../models/superuser");
var Assistant = require("../models/assistant");
var Analyst = require("../models/analyst");
var Client = require("../models/client");
var multer = require("multer");
var multerS3 = require("multer-s3");
var aws = require("aws-sdk");
var Functions=require("../functions");
aws.config.loadFromPath("../private/aws-keys.json");
var s3 = new aws.S3();
//aws private info
var AWSPrivate = require("../../private/awsPrivate");


//AUTHORIZATION

//Check if an user is logged in
midlewareObj.isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do that");
	return res.redirect("/login");
};

//Check if an user is a superuser
midlewareObj.isSuperuser = function (req, res, next) {
	if (req.user.type == "superuser") {
		return next();
	}
	req.flash("error", "You don't have authorization to do that");
	return res.redirect("back");
};

//Check if an user is an assistant or a superuser
midlewareObj.isAssistantSuperuser = function (req, res, next) {
	if (req.user.type == "assistant" || req.user.type == "superuser") {
		return next();
	}
	req.flash("error", "You don't have authorization to do that");
	return res.redirect("back");
};

//Check if an user is an analyst or a superuser
midlewareObj.isAnalystSuperuser = function (req, res, next) {
	if (req.user.type == "analyst" || req.user.type == "superuser") {
		return next();
	}
	req.flash("error", "You don't have authorization to do that");
	return res.redirect("back");
};

//Assuming that the user is a superuser, check if is an authorized superuser
midlewareObj.isAuthorizedSuperuser = function (req, res, next) {
	if (req.user.type == "superuser") {
		if (req.params.superuserID == req.user.userRef) {
			return next();
		}
		else {
			req.flash("error", "You don't have authorization to do that");
			return res.redirect("back");
		}
	}
	else {
		return next();
	}
};

//Assuming that the user is an assistant, checks if is authorized to access the requested resource
midlewareObj.isAuthorizedAssistant = function (req, res, next) {
	if (req.user.type == "assistant") {
		if (req.params.hasOwnProperty("assistantID")) {
			if (req.params.assistantID == req.user.userRef) {
				return next();
			}
			else {
				req.flash("error", "You don't have authorization to do that");
				return res.redirect("back");
			}
		}
		else {
			if (req.params.hasOwnProperty("clientID")) {
				Assistant.findOne({
					_id: req.user.userRef,
					clients: req.params.clientID
				}, function (err, assistant) {
					if (err) {
						req.flash("error", err.message + ", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else {
						if (assistant != null) {
							return next();
						}
						else {
							req.flash("error", "You don't have authorization to do that");
							return res.redirect("back");
						}
					}
				});
			}
			else if (req.params.hasOwnProperty("superuserID")) {
				Superuser.findOne({
					_id: req.params.superuserID,
					assistants: req.user.userRef
				}, function (err, superuser) {
					if (err) {
						req.flash("error", err.message + ", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else {
						if (superuser != null) {
							return next();
						}
						else {
							req.flash("error", "You don't have authorization to do that");
							return res.redirect("back");
						}
					}
				});
			}
			else {
				req.flash("error", "You don't have authorization to do that");
				return res.redirect("back");
			}
		}
	}
	else {
		return next();
	}
};

//Assuming that the user is an analyst, checks if is authorized to access the requested resource
midlewareObj.isAuthorizedAnalyst = function (req, res, next) {
	if (req.user.type == "analyst") {
		if (req.params.hasOwnProperty("analystID")) {
			if (req.params.analystID == req.user.userRef) {
				return next();
			}
			else {
				req.flash("error", "You don't have authorization to do that");
				return res.redirect("back");
			}
		}
		else {
			if (req.params.hasOwnProperty("clientID")) {
				Analyst.findOne({
					_id: req.user.userRef,
					clients: req.params.clientID
				}, function (err, analyst) {
					if (err) {
						req.flash("error", err.message + ", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else {
						if (analyst != null) {
							return next();
						}
						else {
							req.flash("error", "You don't have authorization to do that");
							return res.redirect("back");
						}
					}
				});
			}
			else if (req.params.hasOwnProperty("superuserID")) {
				Superuser.findOne({
					_id: req.params.superuserID,
					analysts: req.user.userRef
				}, function (err, superuser) {
					if (err) {
						req.flash("error", err.message + ", please login again to continue");
						req.logout();
						return res.redirect("/login");
					}
					else {
						if (superuser != null) {
							return next();
						}
						else {
							req.flash("error", "You don't have authorization to do that");
							return res.redirect("back");
						}
					}
				});
			}
			else {
				req.flash("error", "You don't have authorization to do that");
				return res.redirect("back");
			}
		}
	}
	else {
		return next();
	}
};

//PASS THE CURRENT USER VARIABLE TO ALL THE EJS TEMPLATES
midlewareObj.passCurrentUser = function (req, res, next) {
	res.locals.currentUser = req.user;
	return next();
};


//CHECK IF A USER THAT ARRIVES TO THE LANDING PAGE IS ALREADY LOGGED IN
midlewareObj.isLoggedInLandingPage = function (req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.type == "superuser") {
			return res.redirect("/superuser/" + req.user.userRef);
		}
		else if (req.user.type == "assistant") {
			Superuser.findOne({
				assistants: req.user.userRef
			}, function (err, superuser) {
				if (err) {
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else {
					return res.redirect("/superuser/" + superuser._id + "/assistant/" + req.user.userRef);
				}
			});

		}
		else if (req.user.type == "analyst") {
			Superuser.findOne({
				analysts: req.user.userRef
			}, function (err, superuser) {
				if (err) {
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else {
					return res.redirect("/superuser/" + superuser._id + "/analyst/" + req.user.userRef);
				}
			});
		}
		else {
			return next();
		}
	}
	else {
		return next();
	}

};

//SET THE BODY OF ALL REQUESTS IN A STANDARD FORMAT
midlewareObj.fixInputFormat = function (req, res, next) {
   
	if(req.body.assistant){  
		if(!req.body.assistant.clients){
			req.body.assistant.clients=[];
		}
	}
	if (req.body.analyst) {
		if (!req.body.analyst.clients) {
			req.body.analyst.clients = [];
		}
	}
    
	if (req.body.client) {
		if (!req.body.client.maladaptativeBehaviors) {
			req.body.client.maladaptativeBehaviors = [];
		}
		if (!req.body.client.replacementsBehaviors) {
			req.body.client.replacementsBehaviors = [];
		}
		if (!req.body.client.approvals) {
			req.body.client.approvals = [];
		}
	}
	
	return next();
};

//PASS THE FLASH VARIABLES TO EVERY EJS TEMPLATE
midlewareObj.passFlashVariables = function (req, res, next) {
	if (req.url != "/") {
		res.locals.success = req.flash("success");
		res.locals.error = req.flash("error");
	}
	return next();
};
//S3 PHOTO UPLOADER

midlewareObj.uploadPhoto = multer({
	storage: multerS3({
		s3: s3,
		bucket: AWSPrivate.bucket(),
		acl: AWSPrivate.acl(),
		metadata: function (req, file, cb) {
			cb(null, Object.assign({}, req.body));
		},
		key: function (req, file, cb) {
			var id = "";
			if (req.params.hasOwnProperty("clientID")) {
				id = req.params.clientID;
			}
			if (req.params.hasOwnProperty("analystID")) {
				id = req.params.analystID;
			}
			if (req.params.hasOwnProperty("assistantID")) {
				id = req.params.assistantID;
			}
			cb(null, AWSPrivate.key(id));
		}
	})
});

midlewareObj.checkSchedule= function(req,res,next){
	if(req.body.report.startDate && req.body.report.startDate.length>0){
		if(req.user.type=="assistant"){
			Client.findById(req.params.clientID).populate({path:"analystReports",match:{startDate:req.body.report.startDate},select:"schedule"}).exec(function(err,client){
				if(err){
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					if(client!=undefined){
						if(client.analystReports[0]!=undefined){
							let resultOverlapping=Functions.scheduleOverlappingChecker(client.analystReports[0].schedule,req.body.report.schedule);
							if(resultOverlapping[0]==true){
								req.flash("error","There is an overlapping on your schedule and the analyst schedule on day "+resultOverlapping[1]+". You will need to contact the case analyst in order to solve the conflict");
								return res.redirect("back");
							}
							let resultTotalHours=Functions.scheduleTotalHoursChecker(client.analystReports[0].schedule,req.body.report.schedule);
							if(resultTotalHours[0]==true){
								req.flash("error","On day "+resultTotalHours[1]+" there is more than 8 hours of therapy between you and the analyst. You will need to contact the case analyst in order to solve the conflict");
								return res.redirect("back");
							}
							let resultTotalHoursWeekly=Functions.scheduleTotalHoursWeeklyChecker(client.analystReports[0].schedule,req.body.report.schedule);
							if(resultTotalHoursWeekly[0]==true){
								req.flash("error","On the week there is more than 40 hours of therapy between you and the analyst. You will need to contact the case analyst in order to solve the conflict");
								return res.redirect("back");
							}
						}
					}
					return next();
				}
			});
		}
		else if(req.user.type=="analyst"){
			Client.findById(req.params.clientID).populate({path:"assistantReports",match:{startDate:req.body.report.startDate},select:"schedule"}).exec(function(err,client){
				if(err){
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					if(client!=undefined){
						if(client.assistantReports[0]!=undefined){
							let resultOverlapping=Functions.scheduleOverlappingChecker(client.assistantReports[0].schedule,req.body.report.schedule);
							if(resultOverlapping[0]==true){
								req.flash("error","There is an overlapping on your schedule and the assistant schedule on day "+resultOverlapping[1]+". You will need to contact the case assistant in order to solve the conflict");
								return res.redirect("back");
							}
							let resultTotalHours=Functions.scheduleTotalHoursChecker(client.assistantReports[0].schedule,req.body.report.schedule);
							if(resultTotalHours[0]==true){
								req.flash("error","On day "+resultTotalHours[1]+" there is more than 8 hours of therapy between you and the assistant. You will need to contact the case assistant in order to solve the conflict");
								return res.redirect("back");
							}
							let resultTotalHoursWeekly=Functions.scheduleTotalHoursWeeklyChecker(client.assistantReports[0].schedule,req.body.report.schedule);
							if(resultTotalHoursWeekly[0]==true){
								req.flash("error","On the week there is more than 40 hours of therapy between you and the assistant. You will need to contact the case assistant in order to solve the conflict");
								return res.redirect("back");
							}
						}
					}
					return next();
				}
			});
		}
	}
	else{
		return next();
	}
};
midlewareObj.checkOwnSchedule= function(req,res,next){
	if(req.body.report.startDate && req.body.report.startDate.length>0){
		if(req.user.type=="assistant"){
			Assistant.findById(req.user.userRef).populate({path:"reports",match:{startDate:req.body.report.startDate},select:"schedule"}).exec(function(err,assistant){
				if(err){
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					if(assistant!=undefined){
						if(assistant.reports[0]!=undefined){
							let resultOwnChecker=Functions.scheduleOwnOverlappingChecker(assistant.reports,req.body.report.schedule,req.params.reportID);
							if(resultOwnChecker[0]==true){
								Client.findOne({assistantReports:resultOwnChecker[2]},function(err,client){
									if(err){
										req.flash("error", err.message + ", please login again to continue");
										req.logout();
										return res.redirect("/login");
									}
									else{
										req.flash("error","There is an overlapping on the schedule with the client: "+client.firstName+" "+client.lastName +" on day "+resultOwnChecker[1]);
										return res.redirect("back");
									}
								});
							
							}
							else{
								return next();
							}
						}
						else{
							return next();
						}
					}
					else{
						return next();
					}
    
				
				}
			});
		}
		else if(req.user.type=="analyst"){
			Analyst.findById(req.user.userRef).populate({path:"reports",match:{startDate:req.body.report.startDate},select:"schedule"}).exec(function(err,analyst){
				if(err){
					req.flash("error", err.message + ", please login again to continue");
					req.logout();
					return res.redirect("/login");
				}
				else{
					if(analyst!=undefined){
						if(analyst.reports[0]!=undefined){
							let resultOwnChecker=Functions.scheduleOwnOverlappingChecker(analyst.reports,req.body.report.schedule,req.params.reportID);
							if(resultOwnChecker[0]==true){
								Client.findOne({analystReports:resultOwnChecker[2]},function(err,client){
									if(err){
										req.flash("error", err.message + ", please login again to continue");
										req.logout();
										return res.redirect("/login");
									}
									else{
										req.flash("error","There is an overlapping on the schedule with the client: "+client.firstName+" "+client.lastName +" on day "+resultOwnChecker[1]);
										return res.redirect("back");
									}
								});
							
							}
							else{
								return next();
							}
						}
						else{
							return next();
						}
					}
					else{
						return next();
					}
				}
			});
		}
	}
	else{
		return next();
	}
};

module.exports = midlewareObj;

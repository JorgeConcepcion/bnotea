var aws = require("aws-sdk"),
	fs = require("fs");



var functionObj = {};

functionObj.arraycmp = function (modified, original, action) {
	var isThere = false;
	var modifiedVar = [];
	var originalVar = [];
	var returnedElements = [];
	//Converting the entry variables to arrays if necesary
	if (!Array.isArray(modified)) {
		modifiedVar.push(modified);
	}
	else {
		modifiedVar = modified;
	}
	if (!Array.isArray(original)) {
		originalVar.push(original);
	}
	else {
		originalVar = original;
	}
	//Functionality selection
	if (action == "added") {
		modifiedVar.forEach(function (elementModified) {
			originalVar.forEach(function (elementOriginal) {
				if (elementOriginal == elementModified) {
					isThere = true;
				}
			});
			if (!isThere) {
				returnedElements.push(elementModified);
			}
			isThere = false;
		});
	}
	else if (action == "deleted") {
		originalVar.forEach(function (elementOriginal) {
			modifiedVar.forEach(function (elementModified) {
				if (elementModified == elementOriginal) {
					isThere = true;
				}
			});
			if (!isThere) {
				returnedElements.push(elementOriginal);
			}
			isThere = false;
		});
	}
	else if (action == "unchanged") {
		originalVar.forEach(function (elementOriginal) {
			modifiedVar.forEach(function (elementModified) {
				if (elementModified == elementOriginal) {
					isThere = true;
				}
			});
			if (isThere) {
				returnedElements.push(elementOriginal);
			}
			isThere = false;
		});
	}
	return returnedElements;
};

//Used to filter the fuzzy searchs
functionObj.escapeRegex = function (text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//AWS S3 file uploader
functionObj.AWSS3Upload = function (bucket, key, filePath, acl) {
	var s3 = new aws.S3;
	aws.config.loadFromPath("../private/aws-keys.json");
	var uploadParams = {
		Bucket: bucket,
		Key: key,
		Body: "",
		ACL: acl
	};
	var fileStream = fs.createReadStream(filePath);
	fileStream.on("error", function (err) {
		if (err) {
			return err;
		}
	});
	uploadParams.Body = fileStream;
	s3.upload(uploadParams, function (err) {
		if (err) {
			return err;
		}
	});
	return "good";
};
functionObj.scheduleOverlappingChecker=function(schedule1,schedule2){
	var sol=[];
	sol[0]=false;
	schedule1.forEach(function(schedule1Day){
		schedule2.forEach(function(schedule2Day){
			if(schedule2Day.date==schedule1Day.date){
				if(schedule1Day.timeIn &&schedule1Day.timeIn.length>0 && schedule2Day.timeIn &&schedule2Day.timeIn.length>0 ){
					let schedule2In=Number(schedule2Day.timeIn.split(":")[0])+(Number(schedule2Day.timeIn.split(":")[1])/60);
					let schedule2Out=Number(schedule2Day.timeOut.split(":")[0])+(Number(schedule2Day.timeOut.split(":")[1])/60);
					let schedule1In=Number(schedule1Day.timeIn.split(":")[0])+(Number(schedule1Day.timeIn.split(":")[1])/60);
					let schedule1Out=Number(schedule1Day.timeOut.split(":")[0])+(Number(schedule1Day.timeOut.split(":")[1])/60);
					if((schedule1Out-schedule2In)*(schedule2Out-schedule1In)>0){
						sol[0]=true;
						sol[1]=schedule2Day.date;
					}
				}
			}
		});
	});
	return sol;
};

functionObj.scheduleTotalHoursChecker=function(schedule1,schedule2){
	var sol=[];
	sol[0]=false;
	schedule1.forEach(function(schedule1Day){
		schedule2.forEach(function(schedule2Day){
			if(schedule2Day.date==schedule1Day.date){
				if(schedule1Day.timeIn &&schedule1Day.timeIn.length>0 && schedule2Day.timeIn &&schedule2Day.timeIn.length>0 ){
					let schedule2In=Number(schedule2Day.timeIn.split(":")[0])+(Number(schedule2Day.timeIn.split(":")[1])/60);
					let schedule2Out=Number(schedule2Day.timeOut.split(":")[0])+(Number(schedule2Day.timeOut.split(":")[1])/60);
					let schedule1In=Number(schedule1Day.timeIn.split(":")[0])+(Number(schedule1Day.timeIn.split(":")[1])/60);
					let schedule1Out=Number(schedule1Day.timeOut.split(":")[0])+(Number(schedule1Day.timeOut.split(":")[1])/60);
					let schedule1TotalHours=schedule1Out-schedule1In;
					let schedule2TotalHours=schedule2Out-schedule2In;
					if(schedule1TotalHours+schedule2TotalHours>8){
						sol[0]=true;
						sol[1]=schedule2Day.date;
					}
				}
			}
		});
	});
	return sol;
};
functionObj.scheduleOwnOverlappingChecker=function(reports,schedule,id){
	var sol=[];
	sol[0]=false;
	reports.forEach(function(report){
		if(report._id!=id){
            	report.schedule.forEach(function(schedule1Day){
				schedule.forEach(function(schedule2Day){
					if(schedule2Day.date==schedule1Day.date){
						if(schedule1Day.timeIn &&schedule1Day.timeIn.length>0 && schedule2Day.timeIn &&schedule2Day.timeIn.length>0 ){
							let schedule2In=Number(schedule2Day.timeIn.split(":")[0])+(Number(schedule2Day.timeIn.split(":")[1])/60);
							let schedule2Out=Number(schedule2Day.timeOut.split(":")[0])+(Number(schedule2Day.timeOut.split(":")[1])/60);
							let schedule1In=Number(schedule1Day.timeIn.split(":")[0])+(Number(schedule1Day.timeIn.split(":")[1])/60);
							let schedule1Out=Number(schedule1Day.timeOut.split(":")[0])+(Number(schedule1Day.timeOut.split(":")[1])/60);
							if((schedule1Out-schedule2In)*(schedule2Out-schedule1In)>0){
								sol[0]=true;
								sol[1]=schedule2Day.date;
								sol[2]=report._id;
							}	
						}
					}
				});
			});
		}
	
	});
	
	return sol;
};
functionObj.initializeAssistantReport=function(report,client){
	//Assistant Log
	report.assistantLog.state="Started";
	report.assistantLog.log=[];
	report.assistantLog.signatures={assistant:"",caregiver:"",analist:""};
	for(let i=0;i<7;i++){
		report.assistantLog.log.push({progress:"",reinforces:"",status:"",participation:"",environmentalChange:"",setting:"",replacements:[],intervention:{result:"",name:"",behavior:""},behaviors:[]});
	}
	//Behavior
	report.behavior=[];
	client.maladaptativeBehaviors.forEach(function(maladaptativeBehavior){
		let intensityTemp=[[],[],[],[],[],[],[]];
		let frequencyTemp=[];
		report.behavior.push({name:maladaptativeBehavior.name,intensity:intensityTemp,frequency:frequencyTemp,signatures:{assistant:"",analist:""},state:"Started"})
	});
	//Replacement
	report.replacement=[];
	client.replacementsBehaviors.forEach(function(replacementBehavior){
		let completionTemp=[[],[],[],[],[],[],[]];
		let trialsTemp=[];
		report.replacement.push({name:replacementBehavior.name,completion:completionTemp,trials:trialsTemp,signatures:{assistant:"",analist:""},state:"Started"})
	});
	//Supervision
	let characteristicsTemp=[];
	report.supervision={date:"",duration:"",characteristics:characteristicsTemp,performance:"",signatures:{assistant:"",analist:""},state:"Started"};
	//Medical
	let medicalVisitTemp=[];
	let medicationTemp=[];
	report.medical={state:"Started",medicalVisit:medicalVisitTemp,medication:medicationTemp,signatures:{assistant:"",caregiver:""}};
	
	


	
	
	return report;
};
functionObj.initializeAnalistReport=function(report,client){
	//Analist Log
	report.analistLog.state="Started";
	report.analistLog.log=[];
	report.analistLog.signatures={caregiver:"",analist:""};
	for(let i=0;i<7;i++){
		report.analistLog.log.push({progress:""});
	}

	//Caregiver
	let performanceTemp=[[]];
	let dateTemp=[];
	report.caregiver={state:"Started",performance:performanceTemp,date:dateTemp,signatures:{analist:"",caregiver:""}}
	
	
	return report;
};
module.exports = functionObj;

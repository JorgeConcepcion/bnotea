var mongoose=require("mongoose"),
	assistantLog=require("assistantLog"),
	behavior=require("behavior"),
	replacement=require("replacement"),
	supervision=require("supervision"),
	medical=require("medical"),
	analistLog=require("analistLog"),
	caregiver=require("caregiver");
	
    
var assistantReportSchema=new mongoose.Schema({
	startDate:String,
	endDate:String,
	assistantLog:assistantLog,
	behavior:behavior,
	replacement:replacement,
	supervision:supervision,
	medical:medical,
	analistLog:analistLog,
	caregiver:caregiver

});

module.exports=mongoose.model("AssistantReport",assistantReportSchema);
var mongoose=require("mongoose");

var assistantLogSchema=new mongoose.Schema({
	log:
[
	{
		setting:String,
		environmentalChange:String,
		participation:String,
		status:String,
		behaviors:[],
		intervention:{
			behavior:String,
			name:String,
			result:String
		},
		replacements:[],
		reinforces:String,
		progress:String
	}
],
	signatures:{
		assistant:String,
		analist:String,
		caregiver:String
	},
	state:String
});

module.exports=mongoose.model("AssistantLog",assistantLogSchema);
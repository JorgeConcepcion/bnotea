var mongoose=require("mongoose");

var medicalSchema=new mongoose.Schema({
	medicalVisit:[
		{
			doctor:String,
			reason:String,
			date:String,
		}
	],
	medication:[
		{
			name:String,
			action:String
		}
	],
	signatures:{
		assistant:String,
		analist:String,
		caregiver:String
	},
	state:String
});

module.exports=mongoose.model("Medical",medicalSchema);





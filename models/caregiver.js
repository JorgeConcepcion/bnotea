var mongoose=require("mongoose");

var caregiverSchema=new mongoose.Schema({
	performance:[[]],
	date:[],
	signatures:{
		caregiver:String,
		analist:String,
	},
	state:{type:String,default:""}
});

module.exports=mongoose.model("Caregiver",caregiverSchema);
var mongoose=require("mongoose");

var supervisionSchema=new mongoose.Schema({
	date:String,
	duration:Number,
	characteristics:[],
	performance:String,
	signatures:{
		assistant:String,
		analist:String,
		caregiver:String
	},
	state:String

});

module.exports=mongoose.model("Supervision",supervisionSchema);





var mongoose=require("mongoose");

var analistLogSchema=new mongoose.Schema({
	log:
[
	{
		progress:String
	}
],
	signatures:{
		caregiver:String,
		analist:String,
	},
	state:String
});

module.exports=mongoose.model("AnalistLog",analistLogSchema);




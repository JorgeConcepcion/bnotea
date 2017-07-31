var mongoose=require("mongoose");

var behaviorSchema=new mongoose.Schema({
	intensity:[[]],
	frequency:[],
	signatures:{
		assistant:String,
		analist:String,
	},
	state:{type:String,default:""}
								
});

module.exports=mongoose.model("Behavior",behaviorSchema);
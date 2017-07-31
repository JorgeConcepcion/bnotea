var mongoose=require("mongoose");

var replacementSchema=new mongoose.Schema({
	completion:[[]],
	trials:[],
	signatures:{
		assistant:String,
		analist:String,
	},
	state:{type:String,default:""}
});

module.exports=mongoose.model("Replacement",replacementSchema);
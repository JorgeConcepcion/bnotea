var mongoose=require("mongoose");

var analistSchema=new mongoose.Schema({
	firstName:String,
	lastName:String,
	phone:String,
	email:String,
	providerId:String,
	photo:String,
	deactivationSuperuser:String,
	clients:
		[
			{
				type:mongoose.Schema.Types.ObjectId,
				ref:"Client"
			},
		],
	analistReport:
		[
			{
				type:mongoose.Schema.Types.ObjectId,
				ref:"AnalistReport"
			},

		],
});

module.exports=mongoose.model("Analist",analistSchema);
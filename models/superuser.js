var mongoose=require("mongoose");

var superuserSchema=new mongoose.Schema({
	firstName:String,
	lastName:String,
	phone:String,
	email:String,
	company:String,
	providerId:String,
	photo:String,
	analists:
								[
									{
										type:mongoose.Schema.Types.ObjectId,
										ref:"Analist"
									},
								],
	clients:
								[
									{
										type:mongoose.Schema.Types.ObjectId,
										ref:"Client"
									},
								],
	assistants:
								[
									{
										type:mongoose.Schema.Types.ObjectId,
										ref:"Assistant"
									},
								],  
});

module.exports=mongoose.model("Superuser",superuserSchema);
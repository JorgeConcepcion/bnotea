var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
	username:{type:String, unique:true, required:true},
	password:String,
	type:String,
	company:String,
	userRef:mongoose.Schema.Types.ObjectId
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);



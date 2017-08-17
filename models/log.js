var mongoose=require("mongoose");
var mongooseConnect = require("../../private/mongooseConnect");
var logSchema=new mongoose.Schema({
	code:String,
	info:String,
	timeStamp:String,
	user:String
});
var logUri=mongooseConnect.logUri();
var logDb = mongoose.createConnection(logUri);
module.exports=logDb.model("Log",logSchema);

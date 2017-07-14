var mongoose=require("mongoose");

var assistantSchema=new mongoose.Schema({
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
});

module.exports=mongoose.model("Assistant",assistantSchema);


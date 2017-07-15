var mongoose=require("mongoose");

var clientSchema=new mongoose.Schema({
    firstName:String,
    lastName:String,
    phone:String,
    medicaidNumber:String,
    diagnosis:String,
    guardian:String,
    photo:String,
    deactivationSuperuser:String,
    approvals:
            [{
                number:String,
                startDate:Date,
                endDate:Date,
                units:Number,
                procedure:String,
                availableUnits:Number
            }],
    maladaptativeBehaviors:
            [{
                name:String,
                baseline:Number
            }],
    replacementsBehaviors:
            [{
                name:String,
                baseline:Number
            }],
    assistant:
            {
                firstName:{type:String,default:""},
                lastName:{type:String,default:""}
            },
    analist:
            {
                firstName:{type:String,default:""},
                lastName:{type:String,default:""}
            }
        
});

module.exports=mongoose.model("Client",clientSchema);

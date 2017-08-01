//VAR DECLARATION
var express=require("express"),
	router=express.Router({mergeParams:true}),
	moment=require("moment");
router.get("/new",function(req,res){
	let times=[];
	for(let i=0;i<3;i++){
		times.push(moment(Date.now()).subtract(moment(Date.now()).format("d"),"days").subtract(i*7,"days").format("MM/DD/YYYY"));  
	}
	res.render("report/new",{page:"report-new",superuserID:req.params.superuserID,clientID:req.params.clientID,times:times});
});
router.post("/",function(req,res){
	res.send(req.body);
});
module.exports = router;
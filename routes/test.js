var express = require("express"),
    router = express.Router({
        mergeParams: true
    });
    

//Daily Log
router.get("/dailyLog",function(req,res){
    res.render("report/assistantLog/new",{page:"assistantLog-report"});
})
 router.post("/dailyLog",function(req,res){
    res.send(req.body);
})   



router.get("/supervision",function(req,res){
    res.render("report/supervision/new",{page:"supervision-report"});
})
 router.post("/supervision",function(req,res){
    res.send(req.body);
})  


router.get("/medical",function(req,res){
    res.render("report/medical/new",{page:"medical-report"});
})
 router.post("/medical",function(req,res){
    res.send(req.body);
}) 
router.get("/behavior",function(req,res){
    res.render("report/behavior/new",{page:"behavior-report"});
})
 router.post("/behavior",function(req,res){
    res.send(req.body);
})   
router.get("/replacement",function(req,res){
    res.render("report/replacement/new",{page:"replacement-report"});
})
 router.post("/replacement",function(req,res){
    res.send(req.body);
})
router.get("/log",function(req,res){
    res.render("report/analistLog/new",{page:"analistLog-report"});
})
 router.post("/log",function(req,res){
    res.send(req.body);
})
router.get("/caregiver",function(req,res){
    res.render("report/caregiver/new",{page:"caregiver-report"});
})
 router.post("/caregiver",function(req,res){
    res.send(req.body);
})
module.exports = router;
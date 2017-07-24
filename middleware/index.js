var midlewareObj = {};
var Superuser = require("../models/superuser");
var Assistant = require("../models/assistant");
var Analist = require("../models/analist");
var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
aws.config.loadFromPath('./private/aws-keys.json');
var s3 = new aws.S3();
//aws private info
var AWSPrivate = require("../private/awsPrivate");


//AUTHORIZATION

//Check if an user is logged in
midlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    return res.redirect("/login");
};

//Check if an user is a superuser
midlewareObj.isSuperuser = function (req, res, next) {
    if (req.user.type == "superuser") {
        return next();
    }
    req.flash("error", "You don't have authorization to do that");
    return res.redirect("back");
};

//Check if an user is an assistant or a superuser
midlewareObj.isAssistantSuperuser = function (req, res, next) {
    if (req.user.type == "assistant" || req.user.type == "superuser") {
        return next();
    }
    req.flash("error", "You don't have authorization to do that");
    return res.redirect("back");
};

//Check if an user is an analist or a superuser
midlewareObj.isAnalistSuperuser = function (req, res, next) {
    if (req.user.type == "analist" || req.user.type == "superuser") {
        return next();
    }
    req.flash("error", "You don't have authorization to do that");
    return res.redirect("back");
};

//Assuming that the user is a superuser, check if is an authorized superuser
midlewareObj.isAuthorizedSuperuser = function (req, res, next) {
    if (req.user.type == "superuser") {
        if (req.params.superuserID == req.user.userRef) {
            return next();
        }
        else {
            req.flash("error", "You don't have authorization to do that");
            return res.redirect("back");
        }
    }
    else {
        return next();
    }
};

//Assuming that the user is an assistant, checks if is authorized to access the requested resource
midlewareObj.isAuthorizedAssistant = function (req, res, next) {
    if (req.user.type == "assistant") {
        if (req.params.hasOwnProperty("assistantID")) {
            if (req.params.assistantID == req.user.userRef) {
                return next();
            }
            else {
                req.flash("error", "You don't have authorization to do that");
                return res.redirect("back");
            }
        }
        else {
            if (req.params.hasOwnProperty("clientID")) {
                Assistant.findOne({
                    _id: req.user.userRef,
                    clients: req.params.clientID
                }, function (err, assistant) {
                    if (err) {
                        req.flash("error", err.message + ", please login again to continue");
                        req.logout();
                        return res.redirect("/login");
                    }
                    else {
                        if (assistant != null) {
                            return next();
                        }
                        else {
                            req.flash("error", "You don't have authorization to do that");
                            return res.redirect("back");
                        }
                    }
                });
            }
            else if (req.params.hasOwnProperty("superuserID")) {
                Superuser.findOne({
                    _id: req.params.superuserID,
                    assistants: req.user.userRef
                }, function (err, superuser) {
                    if (err) {
                        req.flash("error", err.message + ", please login again to continue");
                        req.logout();
                        return res.redirect("/login");
                    }
                    else {
                        if (superuser != null) {
                            return next();
                        }
                        else {
                            req.flash("error", "You don't have authorization to do that");
                            return res.redirect("back");
                        }
                    }
                });
            }
            else {
                req.flash("error", "You don't have authorization to do that");
                return res.redirect("back");
            }
        }
    }
    else {
        return next();
    }
};

//Assuming that the user is an analist, checks if is authorized to access the requested resource
midlewareObj.isAuthorizedAnalist = function (req, res, next) {
    if (req.user.type == "analist") {
        if (req.params.hasOwnProperty("analistID")) {
            if (req.params.analistID == req.user.userRef) {
                return next();
            }
            else {
                req.flash("error", "You don't have authorization to do that");
                return res.redirect("back");
            }
        }
        else {
            if (req.params.hasOwnProperty("clientID")) {
                Analist.findOne({
                    _id: req.user.userRef,
                    clients: req.params.clientID
                }, function (err, analist) {
                    if (err) {
                        req.flash("error", err.message + ", please login again to continue");
                        req.logout();
                        return res.redirect("/login");
                    }
                    else {
                        if (analist != null) {
                            return next();
                        }
                        else {
                            req.flash("error", "You don't have authorization to do that");
                            return res.redirect("back");
                        }
                    }
                });
            }
            else if (req.params.hasOwnProperty("superuserID")) {
                Superuser.findOne({
                    _id: req.params.superuserID,
                    analists: req.user.userRef
                }, function (err, superuser) {
                    if (err) {
                        req.flash("error", err.message + ", please login again to continue");
                        req.logout();
                        return res.redirect("/login");
                    }
                    else {
                        if (superuser != null) {
                            return next();
                        }
                        else {
                            req.flash("error", "You don't have authorization to do that");
                            return res.redirect("back");
                        }
                    }
                });
            }
            else {
                req.flash("error", "You don't have authorization to do that");
                return res.redirect("back");
            }
        }
    }
    else {
        return next();
    }
};

//PASS THE CURRENT USER VARIABLE TO ALL THE EJS TEMPLATES
midlewareObj.passCurrentUser = function (req, res, next) {
    res.locals.currentUser = req.user;
    return next();
};


//CHECK IF A USER THAT ARRIVES TO THE LANDING PAGE IS ALREADY LOGGED IN
midlewareObj.isLoggedInLandingPage = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.type == "superuser") {
            return res.redirect("/superuser/" + req.user.userRef);
        }
        else if (req.user.type == "assistant") {
            Superuser.findOne({
                assistants: req.user.userRef
            }, function (err, superuser) {
                if (err) {
                    req.flash("error", err.message + ", please login again to continue");
                    req.logout();
                    return res.redirect("/login");
                }
                else {
                    return res.redirect("/superuser/" + superuser._id + "/assistant/" + req.user.userRef);
                }
            });

        }
        else if (req.user.type == "analist") {
            Superuser.findOne({
                analists: req.user.userRef
            }, function (err, superuser) {
                if (err) {
                    req.flash("error", err.message + ", please login again to continue");
                    req.logout();
                    return res.redirect("/login");
                }
                else {
                    return res.redirect("/superuser/" + superuser._id + "/analist/" + req.user.userRef);
                }
            });
        }
        else {
            return next();
        }
    }
    else {
        return next();
    }

};

//SET THE BODY OF ALL REQUESTS IN A STANDARD FORMAT
midlewareObj.fixInputFormat = function (req, res, next) {
   
   if(req.body.assistant){  
        if(!req.body.assistant.clients){
            req.body.assistant.clients=[];
        }
    }
   if (req.body.analist) {
        if (!req.body.analist.clients) {
            req.body.analist.clients = [];
        }
    }
    
    if (req.body.client) {
        if (!req.body.client.maladaptativeBehaviors) {
            req.body.client.maladaptativeBehaviors = [];
        }
        if (!req.body.client.replacementsBehaviors) {
            req.body.client.replacementsBehaviors = [];
        }
        if (!req.body.client.approvals) {
            req.body.client.approvals = [];
        }
    }

    return next();
}

//PASS THE FLASH VARIABLES TO EVERY EJS TEMPLATE
midlewareObj.passFlashVariables = function (req, res, next) {
    if (req.url != "/") {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
    }
    return next();
};
//S3 PHOTO UPLOADER

midlewareObj.uploadPhoto = multer({
    storage: multerS3({
        s3: s3,
        bucket: AWSPrivate.bucket(),
        acl: AWSPrivate.acl(),
        metadata: function (req, file, cb) {
            cb(null, Object.assign({}, req.body));
        },
        key: function (req, file, cb) {
            var id = "";
            if (req.params.hasOwnProperty("clientID")) {
                id = req.params.clientID;
            }
            if (req.params.hasOwnProperty("analistID")) {
                id = req.params.analistID;
            }
            if (req.params.hasOwnProperty("assistantID")) {
                id = req.params.assistantID;
            }
            cb(null, AWSPrivate.key(id));
        }
    })
});

module.exports = midlewareObj;

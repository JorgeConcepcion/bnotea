
//VAR DECLARATION
    //external packages
var express =require("express"),
    app=express(),
    mongoose=require("mongoose"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    expressSession=require("express-session"),
    bodyParser=require("body-parser"),
    methodOverride=require("method-override"),
    flash=require("connect-flash"),
    //models
    User=require("./models/user"),
    //middleware
    Middleware=require("./middleware"),
    //database seed
    seedDB=require("./seedDB"),
    //routes
    superuserRoutes=require("./routes/superuser"),
    indexRoutes=require("./routes/index"),
    assistantRoutes=require("./routes/assistant"),
    authenticationRoutes=require("./routes/authentication"),
    analistRoutes=require("./routes/analist"),
    clientRoutes=require("./routes/client"),
    defaultRoute=require("./routes/default"),
    //private
    mongooseConnect=require("./private/mongooseConnect");
    
//CONNECTING TO MONGO
mongooseConnect.connect();


//APP SETS
app.set("view engine","ejs");


//APP USES
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(expressSession({
    secret:"kjhjbjhdbsksldfjlsdkfjhkurgfdskjbbf",
    resave:false,
    saveUninitialized:false
}));
//authentication with passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//custom midleware
app.use(Middleware.fixInputFormat);
app.use(Middleware.passCurrentUser);
app.use(Middleware.passFlashVariables);
//routes
app.use("/superuser",superuserRoutes);
app.use(indexRoutes);
app.use(authenticationRoutes);
app.use("/superuser/:superuserID/assistant",assistantRoutes);
app.use("/superuser/:superuserID/analist",analistRoutes);
app.use("/superuser/:superuserID/client",clientRoutes);
app.use(defaultRoute);

//SEEDING THE DATABASE
seedDB();

//STARTING THE SERVER
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server started at "+Date.now());
    console.log()
});




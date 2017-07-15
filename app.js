
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
    clientRoutes=require("./routes/client");
 
    
//CONNECTING TO MONGO
mongoose.connect("mongodb://localhost/bnotea");


//APP SETS
app.set("view engine","ejs");


//APP USES
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
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
//routes
app.use("/superuser",superuserRoutes);
app.use(indexRoutes);
app.use(authenticationRoutes);
app.use("/superuser/:superuserID/assistant",assistantRoutes);
app.use("/superuser/:superuserID/analist",analistRoutes);
app.use("/superuser/:superuserID/client",clientRoutes);
//midleware
app.use(Middleware.passCurrentUser);


//SEEDING THE DATABASE
seedDB();

//STARTING THE SERVER
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server started at "+Date.now());
});




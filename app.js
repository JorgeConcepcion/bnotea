
//VAR DECLARATION

var express =require("express"),
    app=express(),
    seedDB=require("./seedDB"),
    mongoose=require("mongoose"),
    superuserRoutes=require("./routes/superuser"),
    indexRoutes=require("./routes/index"),
    assistantRoutes=require("./routes/assistant"),
    authenticationRoutes=require("./routes/authentication"),
    analistRoutes=require("./routes/analist"),
    clientRoutes=require("./routes/client"),
    assistantClientRoutes=require("./routes/assistant-client"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    passportLocalMongoose=require("passport-local-mongoose"),
    expressSession=require("express-session"),
    User=require("./models/user"),
    bodyParser=require("body-parser"),
    Middleware=require("./middleware"),
    methodOverride=require("method-override");
//CONNECTING TO MONGO

mongoose.connect("mongodb://localhost/bnotea");
//APP SETS

app.set("view engine","ejs");


//APP USES
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSession({
    secret:"kjhjbjhdbsksldfjlsdkfjhkurgfdskjbbf",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.static("public"));
app.use("/superuser",superuserRoutes);
app.use(indexRoutes);
app.use(authenticationRoutes);
app.use("/superuser/:superuserID/assistant",assistantRoutes);
app.use("/superuser/:superuserID/analist",analistRoutes);
app.use("/superuser/:superuserID/client",clientRoutes);
app.use("/superuser/:superuserID/assistant/:assistantID/client",assistantClientRoutes);
app.use(Middleware.passCurrentUser);


//SEEDING THE DATABASE
seedDB();
//STARTING THE SERVER
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server started at "+Date.now());
})




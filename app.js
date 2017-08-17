//VAR DECLARATION
//external packages
var express = require("express"),
	app = express(),
	passport = require("passport"),
	mongoose=require("mongoose"),
	LocalStrategy = require("passport-local"),
	expressSession = require("express-session"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	flash = require("connect-flash"),
	MongoDBStore = require("connect-mongodb-session")(expressSession),
	//models
	User = require("./models/user"),
	//middleware
	Middleware = require("./middleware"),
	//database seed
	//seedDB = require("./seedDB"),
	//routes
	superuserRoutes = require("./routes/superuser"),
	indexRoutes = require("./routes/index"),
	assistantRoutes = require("./routes/assistant"),
	authenticationRoutes = require("./routes/authentication"),
	analystRoutes = require("./routes/analyst"),
	clientRoutes = require("./routes/client"),
	defaultRoute = require("./routes/default"),
	reportRoute=require("./routes/report"),
	testRoute=require("./routes/test"),
	//private
	mongooseConnect = require("../private/mongooseConnect"),

	//setting session store
	connectionUri=mongooseConnect.uri(),
	
	store = new MongoDBStore({uri:connectionUri,collection:"sessions"});
		
			
//CONNECTING TO MONGO
mongoose.connect(connectionUri);



//APP SETS
app.set("view engine", "ejs");


//APP USES
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(expressSession({
	secret:"This is a secret",
	cookie:{
		maxAge:1000*60*60*8
	},
	store:store,
	resave:true,
	saveUninitialized:true
}));

//authentication with passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//custom midleware

app.use(Middleware.passCurrentUser);
app.use(Middleware.passFlashVariables);
//routes
app.use("/superuser", superuserRoutes);
app.use(indexRoutes);
app.use(authenticationRoutes);
app.use("/superuser/:superuserID/assistant", assistantRoutes);
app.use("/superuser/:superuserID/analyst", analystRoutes);
app.use("/superuser/:superuserID/client", clientRoutes);
app.use("/superuser/:superuserID/client/:clientID/report",reportRoute);
app.use(testRoute);
app.use(defaultRoute);


//SEEDING THE DATABASE
//seedDB();

//STARTING THE SERVER
app.listen(8080,"0.0.0.0",function() {

});

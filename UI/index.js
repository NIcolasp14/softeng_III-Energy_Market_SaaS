const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');

const serviceAccount = require("./serviceAccountKey.json");

//firebase init
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: ""

});

//coockies csrf
const csrfMiddleware = csrf({cookie: true});

var app = express();

app.use(express.static('views'));

app.set("views","./views");
app.set("view engine","ejs");
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req,res,next) => { 
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
})
//routes
const login = require('./routes/login');
const dashboard = require('./routes/dashboard');
const sessionlogin = require('./routes/sessionLogin');
const sessionlogout = require('./routes/sessionLogout');
const atl = require('./routes/atl');
const gpt = require('./routes/gpt');
const cbf = require('./routes/cbf');
const profile = require('./routes/profile');

app.use("/", login);
app.use("/dashboard", dashboard);
app.use("/sessionLogin", sessionlogin);
app.use("/sessionLogout", sessionlogout);
app.use("/atl", atl);
app.use("/gpt", gpt);
app.use("/cbf", cbf);
app.use("/profile", profile);

module.exports = app;
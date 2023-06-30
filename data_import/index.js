const express = require('express');
const bodyParser = require('body-parser');
const cron = require("node-cron");
const  {Kafka} = require("kafkajs");
const dotenv = require('dotenv').config();

//import * as env from "env-var"
/* ROUTES and how to import routes */
const atl = require('./routes/atl');
const pl = require('./routes/pl');
const agpt = require('./routes/agpt');

/* end of ROUTES and how to import routes */

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//adding headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE'); //call that will support
    res.setHeader('Access-Control-Allow-Headers', "Content-Type, Authorization, X-OBSERVATORY-AUTH"); //headers that it will support(authentication)
    next();
});
// /* Routes used by our project */
app.use('/data_import/atl', atl);
app.use('/data_import/pl', pl);
app.use('/data_import/agpt', agpt);

// /*End of routes used by our project */

// In case of an endpoint does not exist
app.use((req, res, next) => {
    console.log(req);
    res.status(404).json({message: 'Endpoint not found! Here'}); })


module.exports = app;
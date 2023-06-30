const app = require('./index');
const https = require('https');
var fs = require('fs');
const path = require('path');
var initModels = require("./models/init-models");
const sequelize = require('./util/database');

//port initialization
const port = Number(9101);

//it would run the app from index file
const dotenv = require('dotenv').config();

//console.log(process.env.KAFKA_BOOTSTRAP_SERVER);

initModels(sequelize);//initialization of models in sequelize
sequelize
    .sync({})//synchronizattion with database
    .then(result => {
        console.log(process.env.KAFKA_BOOTSTRAP_SERVER);
        app.listen(port, () => console.log(` Secure Server running on port ${port}!`)) //verification message printing
    })
    .catch(err => console.log(err));
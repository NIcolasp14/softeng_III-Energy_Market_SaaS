const app = require('./index');
const https = require('https');
var fs = require('fs');
const path = require('path');
var initModels = require("./models/init-models");
const sequelize = require('./util/database');
const dotenv = require('dotenv').config();

//port initialization
const port = Number(9100);

//it would run the app from index file


initModels(sequelize);//initialization of models in sequelize
sequelize
    .sync({})//synchronizattion with database
    .then(result => {
        app.listen(port, () => console.log(` Secure Server running on port ${port}!`)) //verification message printing
    })
    .catch(err => console.log(err));
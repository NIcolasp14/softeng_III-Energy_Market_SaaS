const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

//change the 8919 with the password of the database in the system
let sequelize;
//check system environment variable NODE_ENV
if (process.env.NODE_ENV == undefined) process.env.NODE_ENV = 'run'

//use of test database
if (process.env.NODE_ENV.trim() === 'test') {
    sequelize =  new Sequelize('ATL','postgres',process.env.DB_PASS, {
        host: 'db', //because it will be dockerized- anti localhost
        dialect: 'postgres',


        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
    });
}
else {//USE OF run database
    sequelize =  new Sequelize('ATL','postgres',process.env.DB_PASS, {
        host: 'localhost',
        dialect: 'postgres',

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
    });
}


//database authentication with password
// let retries=5;
// while(retries) {
//     try {
        sequelize.authenticate()
            .then(() => {
                console.log("Success connecting to database!");
               // break;
            })
            .catch(err => {
                console.error("Unable to connect to the database", err);
            })
    // }catch (e) {
    //     console.log(err);
    //     retries-=1;
    //     console.log(retries);
    //     //wait 5 seconds
    //     await new Promise(res => setTimeout(res,5000));
    //
    // }
//}
module.exports = sequelize;

/*module.exports =  new Sequelize('TL58','postgres','Thalis2021', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});*/
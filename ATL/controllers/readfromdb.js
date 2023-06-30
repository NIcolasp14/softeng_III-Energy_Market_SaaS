const sequelize = require('../util/database');
const initModels = require("../models/init-models");
const models = initModels(sequelize);
const {Kafka} = require("kafkajs");
//import * as env from "env-var"
// end of require models
const dotenv = require('dotenv').config();
var csv = require('csv-express')
const Sequelize = require('sequelize');
const op = Sequelize.Op;

module.exports = function (userid,yyyymmdd_from,country,interval) {
    //if an element is not provided error
    //console.log(yyyymmdd_from,country);
    const kafka = new Kafka({
        clientId: "atl_producer",
        brokers: [process.env.KAFKA_BOOTSTRAP_SERVER]  // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
    })


    if (!country || !yyyymmdd_from ) return null;

    // set startDate and endDate to correct format so as query has right results
    var yyyymmdd_from = yyyymmdd_from.substring(0,4) + "-" + yyyymmdd_from.substring(4,6) + "-" + yyyymmdd_from.substring(6,8);

    let startCorrectFormat = yyyymmdd_from + " 00:00:00";
    // end of correct format

    const producer = kafka.producer({});

    //sql query to database
    sequelize.query('SELECT datetime, load'
        + ' FROM atl INNER JOIN countries ON (atl.mapcode = countries.mapcode)'
        + ' WHERE countries.country = \'' + country
        + '\' AND atl.datetime  BETWEEN DATE(\'' + startCorrectFormat + '\') AND DATE(\'' + startCorrectFormat + '\') + INTERVAL \'24 HOURS\''
        +' AND atl.resolutioncode = \''+ interval +'\''
        + ' AND atl.load is not null', {type: sequelize.QueryTypes.SELECT})
        .then( rows => {
            console.log(rows.length);
            let costs = rows;
            let count = rows.length;

            const producer = kafka.producer();

            if (count > 0){
                //send sql data
            const run_hey = async () => {
                //console.log("sending data");
                await producer.connect()
                for(let i=0;i<rows.length;i++){
                    let row = rows[i];
                    await producer.send({
                                topic: "atl",
                                messages: [{
                                    key: String(0),
                                    value: JSON.stringify({ query_type: "atl",datetime: yyyymmdd_from,country: country,interval: interval ,userid: userid,id: i,final_id:count, data: JSON.stringify(row) }),
                                    partition: 0
                                }]
                            })
                }
            }
                run_hey().catch(e => console.error(`[kafka-producer] ${e.message}`, e))

                console.log("edw pera");

            }
            else
            {
                //send no data if there are not
                const run_hey = async () => {
                    console.log("sending data");
                    await producer.connect()
                        await producer.send({
                            topic: "atl",
                            messages: [{
                                key: String(0),
                                value: JSON.stringify({ query_type:"atl",userid: userid, id: 0, final_id: count, data: [] }),
                                partition: 0
                            }]
                        })
                }
                run_hey().catch(e => console.error(`[kafka-producer] ${e.message}`, e))

                console.log("send no data");
            }
        })
        .catch (err => {
            console.log(err)
            //return res.status(500).json({message: "Internal server error."});//something went wrong
        })


}
const sequelize = require('../util/database');
const initModels = require("../models/init-models");
const models = initModels(sequelize);
const {Kafka} = require("kafkajs");

// end of require models

const dotenv = require('dotenv').config();
var csv = require('csv-express')
const Sequelize = require('sequelize');
const op = Sequelize.Op;


module.exports = function (user_id,yyyymmdd_from,country,generation_type,interval) {
    //kafka configuration
    const kafka = new Kafka({
        clientId: "agpt_producer",
        brokers: [process.env.KAFKA_BOOTSTRAP_SERVER]  // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
    })
    if (!country || !generation_type || !yyyymmdd_from ) return null;

    // set startDate and endDate to correct format so as query has right results
    var yyyymmdd_from = yyyymmdd_from.substring(0,4) + "-" + yyyymmdd_from.substring(4,6) + "-" + yyyymmdd_from.substring(6,8);

    let startCorrectFormat = yyyymmdd_from + " 00:00:00";
    //sql query to database

    sequelize.query('SELECT datetime, actualgeneration as load'
        + ' FROM agpt INNER JOIN countries ON (agpt.mapcode = countries.mapcode)'
        + ' WHERE countries.country = \'' + country + '\' AND agpt.production_type = \'' + generation_type
        + '\' AND agpt.datetime  BETWEEN DATE(\'' + startCorrectFormat + '\') AND DATE(\'' + startCorrectFormat + '\') + INTERVAL \'24 HOURS\''
        + ' AND ' + 'agpt.resolutioncode = \''+interval+'\''
        + ' AND agpt.actualgeneration is not null', {type: sequelize.QueryTypes.SELECT})
        .then( rows => {
           let costs = rows;
           let  count = rows.length;

            const producer = kafka.producer();
            if (count>0) {

                const run = async () => {
                    await producer.connect()
                    //send data if exist
                    for (let i = 0; i < rows.length; i++) {
                        let row = rows[i];
                        await producer.send({
                            topic: "agpt",
                            messages: [{
                                key: String(0),
                                value: JSON.stringify({
                                    query_type: "agpt",
                                    userid: user_id,
                                    id: i,
                                    final_id: count,
                                    data: JSON.stringify(row)
                                }),
                                partition: 0
                            }]
                        })
                    }
                }
                run().catch(e => console.error(`[kafka-producer] ${e.message}`, e))
            }
            else
            {
                //send no data if not found
                const run_hey = async () => {
                    console.log("sending data");
                    await producer.connect()
                        await producer.send({
                            topic: "agpt",
                            messages: [{
                                key: String(0),
                                value: JSON.stringify({ query_type:"agpt",userid: user_id,id: 0,final_id: count, data: [] }),
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
        })


}
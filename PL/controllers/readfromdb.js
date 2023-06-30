const sequelize = require('../util/database');
const initModels = require("../models/init-models");
const models = initModels(sequelize);
const {Kafka} = require("kafkajs");
// end of require models
const dotenv = require('dotenv').config();
var csv = require('csv-express')
const Sequelize = require('sequelize');
const op = Sequelize.Op;

module.exports = function (user_id,yyyymmdd_from,country_in,country_out,interval) {

    console.log(user_id,yyyymmdd_from,country_in,country_out,interval)
    //configure kafka
    const kafka = new Kafka({
        clientId: "pl_producer",
        brokers: [process.env.KAFKA_BOOTSTRAP_SERVER]  // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
    })
    const producer = kafka.producer();
    //if an element is not provided error
    if (!yyyymmdd_from || !country_in || !country_out ) return null;

    // set startDate and endDate to correct format so as query has right results
    var yyyymmdd_from = yyyymmdd_from.substring(0,4) + "-" + yyyymmdd_from.substring(4,6) + "-" + yyyymmdd_from.substring(6,8);

    let startCorrectFormat = yyyymmdd_from + " 00:00:00";
    //sql query send
    sequelize.query('SELECT datetime, flowvalue as load'
        + ' FROM (pl JOIN countries on pl.inmapcode = countries.mapcode) as incountry JOIN countries as outmap on incountry.outmapcode = outmap.mapcode '
        + ' WHERE incountry.country = \'' + country_in + '\' AND outmap.country = \'' + country_out
        + '\' AND datetime  BETWEEN DATE(\'' + startCorrectFormat + '\') AND DATE(\'' + startCorrectFormat + '\') + INTERVAL \'24 HOURS\''
        +' AND resolutioncode = \''+ interval +'\''
        + ' AND flowvalue is not null', {type: sequelize.QueryTypes.SELECT})
        .then( rows => {
            let costs = rows;
            let count = rows.length;
            console.log(count)
            if (count>0) {
                const run = async () => {
                    await producer.connect()
                    for (var i = 0; i < rows.length; i++) {
                        let row = rows[i];
                        await producer.send({
                            topic: "pl",
                            messages: [{
                                key: String(0),
                                value: JSON.stringify({query_type: "pl", userid: user_id,id: i,final_id:count, data: JSON.stringify(row)})
                            }],
                            partition: 0
                        })
                    }
                }
                run().catch(e => console.error(`[kafka-producer] ${e.message}`, e))
            }
            else
            {
                const run_hey = async () => {

                    console.log("sending data");

                    await producer.connect()
                        await producer.send({
                            topic: "pl",
                            messages: [{
                                key: String(0),
                                value: JSON.stringify({ query_type:"pl",userid: user_id,id: 0,final_id: count, data: [] }),
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
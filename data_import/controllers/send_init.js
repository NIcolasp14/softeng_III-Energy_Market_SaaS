const {Kafka} = require("kafkajs");
//import * as env from "env-var"
// end of require models
const dotenv = require('dotenv').config();

var csv = require('csv-express');

module.exports = function (topic_fun,datetime) {
    //if an element is not provided error
    console.log(topic_fun,datetime,"inittttttttt")
   if(!topic_fun||!datetime){return null;}

     const kafka_atl = new Kafka({
         clientId: "init_"+topic_fun,
         brokers: [process.env.KAFKA_BOOTSTRAP_SERVER]  // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
     })
    /*const kafka_atl = new Kafka({
        clientId: "init_"+topic_fun,
        brokers: ['pkc-6ojv2.us-west4.gcp.confluent.cloud:9092'],
        connectionTimeout: 3000,
        ssl: true,
        sasl: {
            mechanism: 'plain',
            username: "TRZIWLHM5W2R7BDT",
            password: "4IXYbzItnqm/Ea5uMQop38UKvH/HHfwXwa83K5ozH1CNAldzCVaW/xI0xRrfQ5+5",
        }
    })*/

    const producer_atl = kafka_atl.producer();

    const run_init_atl = async () => {
        await producer_atl.connect()
        await producer_atl.send({
            topic: topic_fun,
            messages: [{
                key: String(datetime),
                value: JSON.stringify({Message: "init_"+topic_fun, date: datetime})
        }]
        })
        console.log("init--------------------------------here")
        return;
    }

    run_init_atl().catch(e => console.error(`[kafka-producer] ${e.message}`, e))
    console.log("end2--------------------")

    console.log("end3--------------------")

}
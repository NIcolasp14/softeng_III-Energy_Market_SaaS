
const express = require('express');
const bodyParser = require('body-parser');
const writedata = require('./controllers/writedata');
const readdata = require('./controllers/readfromdb');
const init_db = require('./controllers/initializedb');

const dotenv = require('dotenv').config();

const  {Kafka} = require("kafkajs");
//import * as env from "env-var"
/* ROUTES and how to import routes */
const app = express(); //initialization of express app

//kafka configuration
const kafka_import = new Kafka({
    clientId: "consumer_atl",
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVER] // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
})
/* end of ROUTES and how to import routes */

const consumer_import1 = kafka_import.consumer( {groupId: "my-consumer-group1"})

const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`)
            console.error(e)
            await consumer_import1.disconnect()
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
})

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await consumer_import1.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})

var data=[]
var i=0;
//listen to data updating with data import and send new request
const run = async () => {
    await consumer_import1.connect()
    await consumer_import1.subscribe({ topic: "atl" })
    await consumer_import1.run({
        eachMessage: async ({ topic, partition, message }) => {
            message=JSON.parse(message.value)
            console.log("makari")
            //console.log(message)
            if (message.hasOwnProperty("Message")) {
                if (message.Message.toString() == 'init_atl'){
                    init_db(message.date) //import into database
                    console.log("cancel init")
                }
                else if (message.hasOwnProperty("data")){
                    console.log(message.data)
                    writedata(JSON.parse(message.data)) //import into database
                    i=i+1;
                    // console.log(i);
                }

                else if(message.Message.toString()=='end_import'){
                    console.log("end updating")
                    const producer = kafka_import.producer();
                    const run = async () => {
                        await producer.connect()
                        await producer.send({
                            topic: "atl",
                            messages: [{
                                key:String(0),
                                value: JSON.stringify({Message: 'end_updating'}),
                                partition: 0
                        }]
                        })

                    }

                    run().catch(e => console.error(`[kafka-producer] ${e.message}`, e))

                }
            }

        }
    })
}

run().catch(e => console.error(`[kafka-consumer-import] ${e.message}`, e))

// Listen to frontend
/* end of ROUTES and how to import routes */
const consumer_frontend = kafka_import.consumer( {groupId: "my-consumer-group2"})

const errorTypes1 = ['unhandledRejection', 'uncaughtException']
const signalTraps1 = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes1.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`)
            console.error(e)
            await consumer_frontend.disconnect()
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
})

signalTraps1.map(type => {
    process.once(type, async () => {
        try {
            await consumer_frontend.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})

//listen to refresh requests from UI
const run_frontend = async () => {
    await consumer_frontend.connect()
    await consumer_frontend.subscribe({ topic: "atl" })
    await consumer_frontend.run({
        eachMessage: async ({ topic, partition, message }) => {
            message=JSON.parse(message.value);
            console.log(message.query_type);
            if (message.hasOwnProperty("query_type") && message.query_type=='atl' && message.data==undefined){
                console.log(message);
                //message=JSON.parse(message.data)
                readdata(message.userid,message.datetime, message.country, message.interval) //import into database
            }
        }
    })
}

run_frontend().catch(e => console.error(`[kafka-consumer-import] ${e.message}`, e))


// /*End of routes used by our project */

// In case of an endpoint does not exist

module.exports = app;
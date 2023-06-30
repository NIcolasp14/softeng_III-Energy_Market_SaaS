
const express = require('express');
const bodyParser = require('body-parser');
const {Kafka} = require("kafkajs");
const writedata = require('./controllers/writedata');
const readdata = require('./controllers/readfromdb');
const init_db = require('./controllers/initializedb');
/* ROUTES and how to import routes */
const dotenv = require('dotenv').config();


/* end of ROUTES and how to import routes */

const app = express(); //initialization of express app
//kafka configuration
const kafka_import = new Kafka({
    clientId: "consumer_pl",
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVER] // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
})
/* end of ROUTES and how to import routes */
const consumer_import = kafka_import.consumer( {groupId: "my-consumer-group5"})

const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`)
            console.error(e)
            await consumer_import.disconnect()
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
})

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await consumer_import.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})
//listen data update and send new read
var data=[]
const run = async () => {
    await consumer_import.connect()
    await consumer_import.subscribe({ topic: "pl" })
    await consumer_import.run({
        eachMessage: async ({ topic, partition, message }) => {
            message=JSON.parse(message.value)
            if (message.hasOwnProperty("Message")) {

                if (message.Message.toString() == 'init_pl') {
                    init_db(message.date) //import into database
                    console.log("cancel init")
                } else if (message.hasOwnProperty("data")) {
                    console.log(message.data)
                    writedata(JSON.parse(message.data)) //import into database
                } else if (message.Message.toString() == 'end_import') {

                    const producer = kafka_import.producer();
                    const run = async () => {
                        await producer.connect()
                        await producer.send({
                            topic: "pl",
                            messages: [{
                                key: String(0),
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

//kafka configuration
const kafka_frontend = new Kafka({
    clientId: "consumer_pl",
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVER] // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
})
const consumer_frontend = kafka_frontend.consumer( {groupId: "my-consumer-group6"})

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
//listen to refresh post and send data
const run_frontend = async () => {
    await consumer_frontend.connect()
    await consumer_frontend.subscribe({ topic: "pl" })
    await consumer_frontend.run({
        eachMessage: async ({ topic, partition, message }) => {
            message=JSON.parse(message.value)
            if (message.hasOwnProperty("query_type")&&message.query_type=='pl' && message.data==undefined){
                //message=JSON.parse(message.data)
                readdata(message.userid, message.datetime,message.country_in, message.country_out,message.interval) //import into database
            }
        }
    })
}

run_frontend().catch(e => console.error(`[kafka-consumer-import] ${e.message}`, e))

// /*End of routes used by our project */

// In case of an endpoint does not exist

module.exports = app;
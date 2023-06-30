const { validationResult } = require('express-validator');
//const bcrypt = require('bcryptjs');
//const jwt = require('jsonwebtoken');
// end of libraries validation, encrypting, jwt

const fs = require("fs");
const csv = require("fast-csv");
const {Kafka} = require("kafkajs");
//import * as env from "env-var"
const dotenv = require('dotenv').config();

exports.postSystem = (req, res) => {
    //kafka configuration
    const kafka = new Kafka({
        clientId: "pl_producer",
        brokers: [process.env.KAFKA_BOOTSTRAP_SERVER]  // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
    })
    /*const kafka = new Kafka({
        clientId: "pl_producer",
        brokers: ['pkc-6ojv2.us-west4.gcp.confluent.cloud:9092'],
        connectionTimeout: 3000,
        ssl: true,
        sasl: {
            mechanism: 'plain',
            username: "TRZIWLHM5W2R7BDT",
            password: "4IXYbzItnqm/Ea5uMQop38UKvH/HHfwXwa83K5ozH1CNAldzCVaW/xI0xRrfQ5+5",
        }
    })*/
    const producer = kafka.producer();
//require csv file from request
    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload a CSV file!");
        }

        let sessions = [];
        var fail = 0;
        let path = __dirname + "/../uploads/" + req.file.filename;
        var i =0;
        //strip csv file
        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true , delimiter: "\t",}))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                //console.log(row)
                if (row.DateTime == '' || row.ResolutionCode == '' ||row.OutAreaTypeCode == '' || row.OutMapCode == ''
                    ||row.InAreaTypeCode == '' || row.InMapCode == ''||
                    row.FlowValue == ''||row.UpdateTime=='') {
                    fail = fail + 1;
                }
                else if (row.InAreaTypeCode!='CTY'||row.OutAreaTypeCode !='CTY'){
                    fail=fail+1;
                }
                else {
                    let row1;
                    //creation of station record for database
                    row1={
                        datetime: row.DateTime,
                        flowvalue: row.FlowValue,
                        resolutioncode: row.ResolutionCode,
                        updatetime: row.UpdateTime,
                        inmapcode: row.InMapCode,
                        outmapcode: row.OutMapCode,
                        inareacode: row.InAreaTypeCode,
                        outareacode: row.OutAreaTypeCode,
                        ...row1
                    }
                    i=i+1;
                    sessions.push(row1)



                }


            })
            .on("end", () => {
            //send data to pl ms
                sessions.forEach(element => {
                    const run = async () => {
                        await producer.connect()
                        await producer.send({
                            topic: "pl",
                            messages: [{
                                key: String(i),
                                value: JSON.stringify({Message: 'import', data: JSON.stringify(element)})
                            }]
                        })
                        //console.log("SEND ",element);

                        return;
                    }

                    run().catch(e => console.error(`[kafka-producer] ${e.message}`, e))
                });

                //inform that data importing ended
                console.log("Number sent", i);
                console.log("send end")
                const run = async () => {
                    await producer.connect()
                    await producer.send({
                        topic: "pl",
                        messages: [{
                            key: String(i+1),
                            value: JSON.stringify({Message: 'end_import'})
                        }]
                    })
                    return;
                }

                run().catch(e => console.error(`[kafka-producer] ${e.message}`, e));
                console.log("end--------------------")
                //return;
                return res.status(200).send(`import pl data`);
            });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};
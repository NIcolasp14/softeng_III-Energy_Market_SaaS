const { validationResult } = require('express-validator');

const fs = require("fs");
const csv = require("fast-csv");
const  {Kafka, Partitioners} = require("kafkajs");
const dotenv = require('dotenv').config();

exports.postSystem = (req, res) => {
    try {
        //require file
        if (req.file == undefined) {
            return res.status(400).send("Please upload a CSV file!");
        }

        let sessions = [];
        var fail = 0;
        let path = __dirname + "/../uploads/" + req.file.filename;
        var i=0;


        // strip csv file
        let csvParserStream = fs.createReadStream(path)
            .pipe(csv.parse({ headers: true, delimiter: '\t' }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                //if theree is a null dont send
                if (row.DateTime == '' || row.ResolutionCode == '' ||
                    row.AreaTypeCode == '' || row.MapCode == '' || row.ProductionType == '' ||
                    row.TotalLoadValue == ''||row.UpdateTime==''||row.AreaTypeCode != 'CTY') {
                    fail = fail + 1;
                }
                else if (row.AreaTypeCode!='CTY'){
                    fail=fail+1;
                }
                else{

                    var row1=[];
                    //creation of station record for database
                    row1 = {
                        datetime: row.DateTime,
                        load: row.TotalLoadValue,
                        resolutioncode: row.ResolutionCode,
                        updatetime: row.UpdateTime,
                        mapcode: row.MapCode,
                        areacode: row.AreaTypeCode,
                        ...row1
                    }

                    sessions.push(row1)
                    i=i+1;
                    return;
                }
                return;
            }).on("end", () => {

        }).on("end", () => {
            //kafka configuration
             const kafka = new Kafka({
                 clientId: "atl_producer",
                 brokers: [process.env.KAFKA_BOOTSTRAP_SERVER]  // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
                 })
            const producer = kafka.producer();
            console.log("Finished")
            console.log("HEREEEEEEEEEEEEEEEEEEEEE")
                //console.log(sessions[0])
            //send all data
                sessions.forEach(element => {
                    const run = async () => {
                        await producer.connect()
                        await producer.send({
                            topic: "atl",
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

            //inform that data import from csv ended
            console.log("Number sent", i);
            console.log("send end")
            const run = async () => {
                await producer.connect()
                await producer.send({
                    topic: "atl",
                    messages: [{
                        key: String(i+1),
                        value: JSON.stringify({Message: 'end_import'})
                    }]
                })
                return;
            }

            run().catch(e => console.error(`[kafka-producer] ${e.message}`, e));
            console.log("end--------------------")
            return;
        });
            //return res.status(200) ;   //Kafka Pipelining
        console.log("end--------------------")

        return res.status(200).send(`import atl data`);
        console.log("end1--------------------")

        return res.status(200);
        return res.status(200);

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
    return res.status(200);

};
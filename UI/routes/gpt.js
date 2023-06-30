var express=require("express");
var router=express.Router();
const admin = require('firebase-admin');
const {Kafka} = require("kafkajs");
const dotenv = require('dotenv').config();
var socket = require('socket.io');

// Problem with frontend consumer... This is a workaround
var date;
let yyyymmdd;
let country;
let generation_type;
let interval_wrong_format;
var socketid;
var interval;
var interval_int;

function getGlobalData() {
  return JSON.parse(JSON.stringify({date, yyyymmdd, country, generation_type, interval_wrong_format, socketid, interval, interval_int}));
}

// When get request
router.get('/', (req,res)=>{
  const sessionCookie = req.cookies.session || "";
  const userid = req.cookies.userid;
  const host = req.headers.host

  // Verify session cookie
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {

      // Get data from firestore
      admin.firestore().collection('users').doc(userid).get().then((snapshot) => {
        const email = snapshot.data().email;
        const expirationDate = snapshot.data().expirationDate;
        
        //Check if expired
        const currentDate = new Date();
        const currentTimestamp = currentDate.getTime();
        var diff = (expirationDate - currentTimestamp)/(1000*60*60*24); //Difference in days
        var daysleft = diff.toFixed(1); //Days left in integer
        var expired=true;
        //If diff>0 still has some time left.
        if (diff > 0) {expired = false}

        // If not expired render gpt page
        if(!expired) {

          var io = req.app.get('socketio')
          res.render("plots_gpt.ejs", {email: email, daysleft:daysleft, host:host, gpt:true, cbf:false});

          // Create a socket to send data for graph
          io.sockets.on('connection', (socket) => {
            console.log("Get ",socket.id)
          })
        
        // If expired redirect to profile
        } else {
            res.redirect('/profile');
        }
      })
    })
    .catch((error) => {
      console.log(error)
      res.redirect("/");
    });
  });

  router.post('/', (req,res)=>{
    const sessionCookie = req.cookies.session || "";
    const userid = req.cookies.userid;

    // console.log("post")
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(() => {

        admin.firestore().collection('users').doc(userid).get().then((snapshot) => {
          const email = snapshot.data().email;
          const expirationDate = snapshot.data().expirationDate; //This is a timestamp and NOT a date
        
          const currentDate = new Date();
          const currentTimestamp = currentDate.getTime();
          var diff = (expirationDate - currentTimestamp)/(1000*60*60*24); //Difference in days
          var daysleft = diff.toFixed(1); //Days left in integer
          var expired=true;
          //If diff>0 still has some time left.
          if (diff > 0) {expired = false}
    
          if(!expired) {

            var io = req.app.get('socketio')
            date = req.body.datetime;
            yyyymmdd = date.slice(0,4) + date.slice(5,7) + date.slice(8,10);
            country = req.body.country;
            generation_type = req.body.generation_type;
            interval_wrong_format = req.body.interval;
            socketid = req.body.socketid;

            if (interval_wrong_format == "15 minutes")
            {
              interval = "PT15M";
              interval_int = 15;
            } else if (interval_wrong_format == "30 minutes"){
              interval = "PT30M";
              interval_int = 30
            } else if (interval_wrong_format == "60 minutes"){
              interval = "PT60M";
              interval_int = 60;
            }
            // console.log(interval)
            // Produce the data from backend when refresh is pressed
              const kafka = new Kafka({
                  clientId: "agpt_producer_2",
                  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER]  // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
                  //createPartitioner: Partitioners.LegacyPartitioner
              })
              const producer2 = kafka.producer();

              const run = async () => {
                  await producer2.connect()
                      await producer2.send({
                          topic: "agpt",
                          messages: [{
                              key: String(yyyymmdd),
                              value: JSON.stringify({ query_type: 'agpt',  userid: userid, datetime: yyyymmdd ,country: country, interval: interval, generation_type: generation_type })
                          }] 
                      })
              console.log("sent agpt query")
              }

              run().catch(e => console.error(`[kafka-producer] ${e.message}`, e))

              // Listen for new data
              const kafka_frontend = new Kafka({
                  clientId: "consumer_frontend_agpt",
                  brokers: ["localhost:9092"] // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
              })
              /* end of ROUTES and how to import routes */
              const consumer_frontend = kafka_frontend.consumer( {groupId: "my-consumer-group9"})

              const errorTypes1 = ['unhandledRejection', 'uncaughtException']
              const signalTraps1 = ['SIGTERM', 'SIGINT', 'SIGUSR2']

              errorTypes1.map(type => {
                  process.on(type, async e => {
                      try {
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
            let data_arr=[]
              const run_frontend = async () => {
                  await consumer_frontend.connect()
                  await consumer_frontend.subscribe({ topic: "agpt" })
                  await consumer_frontend.run({
                      eachMessage: async ({ topic, partition, message ,heartbeat }) => {
                          
                          message = JSON.parse(message.value);

                          if (message.Message=='end_updating'){ //if end update
                              //send the query again
                              console.log("data_getting_end")
                              const kafka = new Kafka({
                                  clientId: "agpt_producer_frontend",
                                  brokers: ["localhost:9092"]  // [env.get("KAFKA_BOOTSTRAP_SERVER").required().asString()],
                              })

                              const run = async () => {
                                  const producer = kafka.producer();
                                  await producer.connect()
                                  await producer.send({
                                      topic: "agpt",
                                      messages: [
                                          {
                                              key: String(yyyymmdd),
                                              value: JSON.stringify({ query_type: 'agpt', userid: userid, datetime: getGlobalData().yyyymmdd, country: getGlobalData().country, interval: getGlobalData().interval, generation_type: getGlobalData().generation_type
                                              })
                                          }]
                                  })
                              }

                              run().catch(e => console.error(`[kafka-producer] ${e.message}`, e))

                          } else if (message.userid == userid && message.query_type=='agpt' && message.hasOwnProperty("data") ){ //if end update  ////change
                              
                              let data=message.data

                              if (Number(message.id) == 0) {
                                data_arr = []
                              }

                              let new_data = new Array(24*60/getGlobalData().interval_int).fill(null)

                              if (Number(message.final_id)-1 >= Number(message.id)){

                                  let data1 = JSON.parse(message.data)
                                  data_arr.push(data1)

                                  if (Number(message.final_id)-1 == Number(message.id)){

                                    for (let i=0; i<data_arr.length; i++)
                                    {
                                        let fulldate = new Date(data_arr[i].datetime)
                                        var hours = fulldate.getHours()
                                        var minutes = fulldate.getMinutes()
                                        new_data[hours*60/getGlobalData().interval_int + minutes/getGlobalData().interval_int] = data_arr[i].load
                                    }

                                    console.log(new_data)
                                    
                                    // Send to the client the data needed to plot
                                    var description = getGlobalData().generation_type + " generations for " + getGlobalData().country + " on " + getGlobalData().date
                                    var text = "GPT"
                                    console.log("Final ", socketid)
                                    io.to(socketid).emit('gpt', JSON.stringify({
                                        new_data: new_data,
                                        interval: getGlobalData().interval_int, 
                                        datetime: getGlobalData().date,
                                        description: description,
                                        text: text,
                                      })
                                    )
                                  }
                              } else if (Number(message.final_id)==Number(0)) {

                                  var description = getGlobalData().generation_type + " generations for " + getGlobalData().country + " on " + getGlobalData().date
                                  var text = "GPT - No Data Found"
                                  console.log("Final ", socketid)
                                  io.to(socketid).emit('gpt', JSON.stringify({
                                      new_data: new_data,
                                      interval: getGlobalData().interval_int, 
                                      datetime: getGlobalData().date,
                                      description: description,
                                      text: text,
                                    })
                                  )
                              }

                          }
                          else if(message.hasOwnProperty("Message")&&message.Message=="sent"&&message.userid == userid&&message.query_type=='agpt') {
                              console.log("get nea dedomena")

                          }

                      }
                  })
              }
              run_frontend().catch(e => console.error(`[kafka-producer] ${e.message}`, e))
            console.log(data_arr.length)
          } else {
              res.redirect('/profile');
          }
        })
      })
      .catch((error) => {
        res.redirect("/");
      });



});

module.exports=router;
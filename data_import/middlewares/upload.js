const multer = require("multer");
const send_init = require('../controllers/send_init');

const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("csv")) {
        cb(null, true);
        console.log("uploadiiiiingg")
    } else {
        cb("Please upload only csv file.", false);
    }
};

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/../uploads')
    },
    filename: function (req, file, cb) {
        //checking the name of the file and extract query type and date
        const elements = file.originalname.split("_"); //pinakas me ta elements tou string
        let query_type=""
        console.log(elements)
        if (elements[3]=="01") {
           // var datetime = elements[0] + "-" + elements[1] + "-" + elements[2];

            // = datetime + " 00:00:00";
            let datetime = new Date(elements[0], elements[1], elements[2], 0, 0, 0);
            console.log(elements[4])
            console.log(elements[0]);
            //const elements_4 = elements[4].split("."); //pinakas me ta elements tou string
            //console.log(elements_4[0]);
            if(elements[4].includes("ActualTotalLoad")){
                query_type="atl"
            }
            else if(elements[4].includes("AggregatedGenerationPerType")){
                query_type="agpt"
            }
            else if(elements[4].includes("PhysicalFlows")){
                query_type="pl"
            }
            console.log(query_type,datetime,"upload")
            // send_init(query_type,datetime);
        }
        cb(null, `${Date.now()}-${file.originalname}`)
        console.log("okay-1111111111111111111111111111111111111111111111111")
    }
})

var uploadFile = multer({ storage: storage, fileFilter: csvFilter });
module.exports = uploadFile;
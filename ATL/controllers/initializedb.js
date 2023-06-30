const sequelize = require('../util/database');
let initModels = require("../models/init-models");
let models = initModels(sequelize);

// end of require models

let csv = require('csv-express')
const Sequelize = require('sequelize');
const op = Sequelize.Op;


module.exports = function (date_time) {
    sequelize.options.logging = false

    console.log(date_time)
    //var date_time = date_time.substring(0,4) + "-" + date_time.substring(4,6) + "-" + date_time.substring(6,8);
    let country=['AL', 'AM', 'AT', 'AZ', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ',
        'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GE', 'GR', 'HR', 'HU',
        'IE', 'IT', 'LT', 'LU', 'LV', 'MD', 'ME', 'MK', 'MT', 'NL', 'NO',
        'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SK', 'TR', 'UA', 'XK']

    let date=new Date(date_time)
    console.log(date)
    let date1=new Date(date);
    let date2=new Date(date); //by value
    let array15=[],array30=[],array60 = [];
    let h=date.getHours()
    let d=date.getDay()
    let month=date.getMonth()
    let year=date.getFullYear()
    let min=date.getMinutes()
    //date = new Date(date_time.substring(0,4).valueOf() , date_time.substring(4,6).valueOf(), date_time.substring(6,8).valueOf()); //year // months //days // hours //mins //sec
    //console.log(m)
    //console.log(date_time().getMinutes())
// Here we will find the closest time
// If it's 13:09 we'll iterate to 13:15 and stop
//
    console.log(year,month,d,h,min)
// We'll iterate fifteen times in the worst case scenario
//      while (min % 15 !== 0) {
//         date=date.setMinutes ( min + 1 );
//      }
console.log(date)
// A whole day has 24 * 4 quarters of an hour
// Let's iterate using for loop
    for (let i = 0; i < 24 * 4; i++) {
        let h=date.getHours()
        let d=date.getDay()
        let month=date.getMonth()
        let year=date.getFullYear()
        let min=date.getMinutes()
        array15.push(new Date(year+'-'+month+'-'+d+' '+h + ':' + min+':00'));
        date.setMinutes ( min + 15);
        console.log(date)
    }
    for (let i = 0; i < 24 * 2; i++) {
        h=date1.getHours()
        d=date1.getDay()
        month=date1.getMonth()
        year=date1.getFullYear()
        min=date1.getMinutes()
        array30.push(new Date(year+'-'+month+'-'+d+' '+h + ':' + min+':00'));
        date1.setMinutes ( min + 30);
    }
    for (let i = 0; i < 24 *1; i++) {
        h=date2.getHours()
        d=date2.getDay()
        month=date2.getMonth()
        year=date2.getFullYear()
        min=date2.getMinutes()
        array60.push(new Date(year+'-'+month+'-'+d+' '+h + ':' + min+':00'));
        date2.setMinutes ( min + 60);
    }

    //gia 15mins
    //console.log(array60)
    //console.log(country.length)
    rows15=[]
    var row15;
    for(let j=0;j<country.length;j++) {
        for (let i = 0; i < 24 * 4; i++) {
            row15=[];
            //creation of station record for database
            row15 = {
                datetime: array15[i],
                mapcode: country[j],
                resolutioncode: 'PT15M',
                //...row15
            }
            //console.log(row15)
             models.atl.create(row15,{ignoreDuplicates: true}).then(() => {
                console.log("row15", row15)
                 return;// models.atl.count(); //count records for reasuaring
             }).catch(function(error){
                 //res.send(error);
                // console.log('row 15 Error during Post: ' + error);
             });

            //rows15.push(row15);//list of stations records
        }
    }
    console.log(i,j)
console.log(array15)
    rows30=[]
    var row30=[]
    for(var j=0;j<country.length;j++) {
        for (var i = 0; i < 24 * 2; i++) {
            row30=[];
            //creation of station record for database
            row30 = {
                datetime: array30[i],
                mapcode: country[j],
                resolutioncode: 'PT30M',
                //...row30
            }
            //console.log(rows15)

             models.atl.create(row30,{ignoreDuplicates: true}).then(() => {
                 //console.log("row30", row30)

                 return ;//models.atl.count(); //count records for reasuaring
             }).catch(function(error){
                //res.send(error);
                 //console.log('row 30 Error during Post: ' + error);
             });

            // rows30.push(row30);//list of stations records
        }
    }
    rows60=[]
    var row60;
    for(var j=0;j<country.length;j++) {
        for (var i = 0; i < 24 * 1; i++) {
            row60=[];
            //creation of station record for database
            row60 = {
                datetime: array60[i],
                mapcode: country[j],
                resolutioncode: 'PT60M',
               // ...row60
            }
            //rows15.push(row60);//list of stations records
             models.atl.create(row60,{ignoreDuplicates: true}).then(() => {
                 //console.log("row60", row60)

                 return;// models.atl.count(); //count records for reasuaring
             }).catch(function(error){
                // res.send(error);
                 //console.log('row 60 Error during Post: ' + error);
             });

        }
    }

    //take aggregated data from kafka and push them to database
    //console.log(array30)

    //console.log(array60);

    return;
}
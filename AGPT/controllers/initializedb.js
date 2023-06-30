const sequelize = require('../util/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);

// end of require models

var csv = require('csv-express')
const Sequelize = require('sequelize');
const op = Sequelize.Op;
var testDate = "1/1/2010"


module.exports = function (date_time) {
    //var date_time = date_time.substring(0,4) + "-" + date_time.substring(4,6) + "-" + date_time.substring(6,8);
    sequelize.options.logging = false

    let country=['AL', 'AM', 'AT', 'AZ', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ',
        'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GE', 'GR', 'HR', 'HU',
        'IE', 'IT', 'LT', 'LU', 'LV', 'MD', 'ME', 'MK', 'MT', 'NL', 'NO',
        'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SK', 'TR', 'UA', 'XK']

    let gen_type=['Biomass',
        'Fossil Brown coal/Lignite',
        'Fossil Coal-derived gas',
        'Fossil Gas',
        'Fossil Hard coal',
        'Fossil Oil',
        'Fossil Oil shale',
        'Fossil Peat',
        'Geothermal',
        'Hydro Pumped Storage',
        'Hydro Run-of-river and poundage',
        'Hydro Water Reservoir',
        'Marine',
        'Nuclear',
        'Other',
        'Other renewable',
        'Solar',
        'Waste',
        'Wind Offshore',
        'Wind Onshore']

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
// Here we will find the closest time
// If it's 13:09 we'll iterate to 13:15 and stop
//
// We'll iterate fifteen times in the worst case scenario
//     while (date.getMinutes() % 15 !== 0) {
//         date.setMinutes ( date.getMinutes() + 1 );
//     }

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
    rows15=[]
    for(var a=0;a<gen_type.length;a++) {
        for (var j = 0; j < country.length; j++) {
            for (var i = 0; i < 24 * 4; i++) {
                var row15;
                //creation of station record for database
                row15 = {
                    datetime: array15[i],
                    mapcode: country[j],
                    resolutioncode: 'PT15M',
                    production_type:gen_type[a],
                    ...row15
                }
                //rows15.push(row15);//list of stations records
                models.agpt.create(row15,{ignoreDuplicates: true}).then(() => {
                    console.log("row15", row15)
                    return;// models.atl.count(); //count records for reasuaring
                }).catch(function(error){
                    //res.send(error);
                    // console.log('row 15 Error during Post: ' + error);
                });

            }
        }
    }

    rows30=[]
    for(var a=0;a<gen_type.length;a++) {
        for (var j = 0; j < country.length; j++) {
            for (var i = 0; i < 24 * 2; i++) {
                var row30;
                //creation of station record for database
                row30 = {
                    datetime: array30[i],
                    mapcode: country[j],
                    resolutioncode: 'PT30M',
                    production_type:gen_type[a],
                    ...row30
                }
                //rows30.push(row30);//list of stations records
                models.agpt.create(row30,{ignoreDuplicates: true}).then(() => {
                    //console.log("row30", row30)

                    return ;//models.atl.count(); //count records for reasuaring
                }).catch(function(error){
                    //res.send(error);
                    //console.log('row 30 Error during Post: ' + error);
                });
            }
        }
    }
    rows60=[]
    for(var j=0;j<gen_type.length;i++) {
        for (var j = 0; j < country.length; i++) {
            for (var i = 0; i < 24 * 1; i++) {
                var row60;
                //creation of station record for database
                row60 = {
                    datetime: array60[i],
                    mapcode: country[j],
                    resolutioncode: 'PT60M',
                    production_type: gen_type[i],
                    ...row60
                }
                //rows15.push(row60);//list of stations records
                models.agpt.create(row60,{ignoreDuplicates: true}).then(() => {
                    //console.log("row60", row60)

                    return;// models.atl.count(); //count records for reasuaring
                }).catch(function(error){
                    // res.send(error);
                    //console.log('row 60 Error during Post: ' + error);
                });
            }
        }
    }

    //take aggregated data from kafka and push them to database
    // models.agpt.bulkCreate(row15);
    // models.agpt.bulkCreate(row30);
    // models.agpt.bulkCreate(row60);
return;
}
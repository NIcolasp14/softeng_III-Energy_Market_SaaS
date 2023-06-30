const sequelize = require('../util/database');
const initModels = require("../models/init-models");
const models = initModels(sequelize);
// end of require models

var csv = require('csv-express')
const Sequelize = require('sequelize');
const op = Sequelize.Op;

var updateOrCreate = function (model, where, newItem, onCreate, onUpdate, onError) {
    // First try to find the record
    model.findOne({where: where}).then(function (foundItem) {
        if (!foundItem) {
            // Item not found, create a new one
            model.create(newItem)
                .then(onCreate)
                .catch(onError);
        } else {
            // Found an item, update it
            model.update(newItem, {where: where})
                .then(onUpdate)
                .catch(onError);
            ;
        }
    }).catch(onError);
}
module.exports = function (data) {
    data.flowvalue=Number(data.flowvalue)
    data.datetime=new Date(data.datetime)
    data.updatetime=new Date(data.updatetime)
//     models.agpt.upsert(data,//{updateOnDuplicate: ["firstName", "status"]},
// )
//         .then(() => {
//             return models.agpt.count();
//         })
//         .then(totalPasses => {
//             console.log(totalPasses);
//             console.log(data.length)
//             });
    updateOrCreate(
        models.pl, {datetime:data.datetime, inmapcode:data.inmapcode,outmapcode:data.outmapcode,resolutioncode:data.resolutioncode}, data,
        function () {
            console.log('created');
            return;
        },
        function () {
            return;
            console.log('updated');
        },
        console.log);
    return;
    }
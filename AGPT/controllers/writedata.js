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
    data.actualgeneration=Number(data.actualgeneration)
    data.actualcon=Number(data.actualcon)
    data.datetime=new Date(data.datetime)
    data.updatetime=new Date(data.datetime)
//if exists update else create new record
    updateOrCreate(
        models.agpt, {datetime:data.datetime, mapcode:data.mapcode,resolutioncode:data.resolutioncode,production_type:data.production_type}, data,
        function () {
            //console.log('created');
            return;
        },
        function () {
            return;
            //console.log('updated');
        },
        console.log);
    return;
    }
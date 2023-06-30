var DataTypes = require("sequelize").DataTypes;
var _countries = require("./countries");
var _pl = require("./pl");

function initModels(sequelize) {
  var countries = _countries(sequelize, DataTypes);
  var pl = _pl(sequelize, DataTypes);


  return {
    countries,
    pl,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

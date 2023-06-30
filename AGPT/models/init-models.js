var DataTypes = require("sequelize").DataTypes;
var _agpt = require("./agpt");
var _countries = require("./countries");

function initModels(sequelize) {
  var agpt = _agpt(sequelize, DataTypes);
  var countries = _countries(sequelize, DataTypes);

  agpt.belongsTo(countries, { as: "mapcode_country", foreignKey: "mapcode"});
  countries.hasMany(agpt, { as: "agpts", foreignKey: "mapcode"});

  return {
    agpt,
    countries,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

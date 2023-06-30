var DataTypes = require("sequelize").DataTypes;
var _atl = require("./atl");
var _countries = require("./countries");

function initModels(sequelize) {
  var atl = _atl(sequelize, DataTypes);
  var countries = _countries(sequelize, DataTypes);

  atl.belongsTo(countries, { as: "mapcode_country", foreignKey: "mapcode"});
  countries.hasMany(atl, { as: "atls", foreignKey: "mapcode"});

  return {
    atl,
    countries,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

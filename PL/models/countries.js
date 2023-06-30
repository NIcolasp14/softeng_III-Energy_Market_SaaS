const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('countries', {
    area_reference: {
      type: DataTypes.STRING,
      allowNull: false
    },
    areaname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mapcode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    areatypecode: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'countries',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "countries_pkey",
        unique: true,
        fields: [
          { name: "mapcode" },
        ]
      },
    ]
  });
};

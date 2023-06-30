const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('atl', {
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    },
    load: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    resolutioncode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    updatetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    mapcode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'countries',
        key: 'mapcode'
      }
    },
    areacode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'atl',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "atl_pkey",
        unique: true,
        fields: [
          { name: "datetime" },
          { name: "resolutioncode" },
          { name: "mapcode" },
        ]
      },
    ]
  });
};

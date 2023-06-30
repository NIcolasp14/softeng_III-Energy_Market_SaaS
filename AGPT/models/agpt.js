const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('agpt', {
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    },
    actualgeneration: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    actualcon: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    resolutioncode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
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
    production_type: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    updatetime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'agpt',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "agpt_pkey",
        unique: true,
        fields: [
          { name: "datetime" },
          { name: "mapcode" },
          { name: "production_type" },
          { name: "resolutioncode" },
        ]
      },
    ]
  });
};

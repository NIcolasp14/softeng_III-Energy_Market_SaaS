const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pl', {
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    },
    flowvalue: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    resolutioncode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    updatetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    inmapcode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    outmapcode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    inareacode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    outareacode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'pl',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pl_pkey",
        unique: true,
        fields: [
          { name: "datetime" },
          { name: "resolutioncode" },
          { name: "inmapcode" },
          { name: "outmapcode" },
        ]
      },
    ]
  });
};

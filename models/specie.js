'use strict';

const Sequelize = require('sequelize');

module.exports = (db) => {
  const Specie = db.define('Specie', {
    id: {
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      type: Sequelize.UUID
    },
    name: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING(32)
    }
  }, {
    tableName: 'species'
  });

  return Specie;
};
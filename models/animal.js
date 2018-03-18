'use strict';
const Sequelize = require('sequelize');

module.exports = function(db) {
  const Animal = db.define('Animal', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    tableName: 'animals'
  });

  // Static
  Animal.listAnimals = function() {
    return this.findAll();
  };
};

module.exports.register = function({ Animal, Specie }) {
  Animal.belongsTo(Specie, {as: 'species', foreignKey: 'specieId'});
};
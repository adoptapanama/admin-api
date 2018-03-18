'use strict';
const Sequelize = require('sequelize');

module.exports = function(db) {
  const Specie = db.define('Specie', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(64),
      allowNull: false
    },
    description: {
      type: Sequelize.STRING(256),
      allowNull: true
    }
  }, {
    tableName: 'species'
  });

  // Static
  Specie.listSpecies = function() {
    return this.findAll({
      order: [['name', 'ASC']]
    });
  };

  Specie.getSpecieByName = function(name) {
    return this.findOne({
      where: { name }
    });
  };


  // Instance
  Specie.prototype.getDescription = function() {
  };
};

module.exports.register = function({ Specie, Animal}) {
  Specie.belongsToMany(Animal, {as: 'animals', foreignKey: 'animalId', through: 'animal_species'});
};
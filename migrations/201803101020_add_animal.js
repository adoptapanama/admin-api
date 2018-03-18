'use strict';
const { addIndex, removeIndex } = require('../lib/helpers').fn;
const uuid = require('uuid/v4');

module.exports = {
  up: async function(action, Sequelize, db) {
    await action.createTable('animals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await action.createTable('animal_species', {
      specieId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      animalId: {
        type: Sequelize.UUID,
        allowNull: false
      },

      createdAt:Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await db.query(addIndex('animal_species', 'animalId'));
    await db.query(addIndex('animal_species', 'specieId'));

    await action.bulkInsert('animals', [{
      id: uuid(),
      name: 'kfhaof',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async function(action, Seq, db) {
    await db.query(removeIndex('animal_species', 'animalId'));
    await db.query(removeIndex('animal_species', 'specieId'));

    await action.dropTable('animales');
    await action.dropTable('animals_species');
  }
};
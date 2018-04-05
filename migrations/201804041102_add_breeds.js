'use strict';
const { addIndex, removeIndex } = require('../lib/helpers').fn;

module.exports = {
  up: async function(action, Sequelize, db) {
    await action.createTable('breeds', {
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
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await action.createTable('breed_species',{
        breedID:{
            type: Sequelize.UUID,
            allowNull: false
        },
        specieID:{
            type: Sequelize.UUID,
            allowNull: false
        },
    });

    await db.query(addIndex('breed_species', 'breedId'));
    await db.query(addIndex('breed_species', 'specieId'));
  },

  down: async function(action, Sequelize, db) {
    await db.query(removeIndex('breed_species', 'breedId'));
    await db.query(removeIndex('breed_species', 'specieId'));

    await action.dropTable('breeds');
    await action.dropTable('breed_species');
  }
};
'use strict';
const { addIndex, removeIndex } = require('../lib/helpers').fn;

module.exports = {
  up: async function(action, Sequelize, db) {
    await action.createTable('species', {
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

    await db.query(addIndex('species', 'name'));
  },

  down: async function(action, Sequelize, db) {
    await db.query(removeIndex('species', 'name'));
    await action.dropTable('species');
  }
};
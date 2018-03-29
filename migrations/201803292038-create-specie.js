'use strict';

const uuid = require('uuid/v4');

module.exports = {
  up: (action, Sequelize) => {
    return action.createTable('species', {
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
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    }).then(() => {
      return action.bulkInsert('species', [{
        id: uuid(),
        name: 'perro',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: uuid(),
        name: 'gato',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    });
  },
  down: (action, Sequelize) => {
    return action.dropTable('species');
  }
};
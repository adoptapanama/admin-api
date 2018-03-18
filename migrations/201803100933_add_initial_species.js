'use strict';
const uuid = require('uuid/v4');

module.exports = {
  up: function(action, Sequelize) {
    const species = [{
      id: uuid(),
      name: 'Perro',
      description: 'Canino',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      name: 'Gato',
      description: 'Gato',
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    return action.bulkInsert('species', species);
  },

  down: function(action, Sequelize, db) {
    return db.query('DELETE FROM species;');
  }
};
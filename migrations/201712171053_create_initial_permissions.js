'use strict';
const uuid = require('uuid/v4');

module.exports = {
  up: function(action) {
    const permissions = [{
      id: uuid(),
      resource: 'users',
      name: 'list',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      resource: 'users',
      name: 'create',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      resource: 'users',
      name: 'view',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      resource: 'users',
      name: 'update',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      resource: 'roles',
      name: 'list',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      resource: 'roles',
      name: 'create',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      resource: 'roles',
      name: 'view',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      resource: 'roles',
      name: 'update',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuid(),
      resource: 'permissions',
      name: 'list',
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    return action.bulkInsert('permissions', permissions);
  },

  down: function(action, Sequelize, db) {
    return db.query('DELETE FROM permissions;');
  }
};
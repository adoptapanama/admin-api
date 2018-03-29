'use strict';
const UserModel = require('../models/user');

module.exports = {
  up: function(action, Sequelize, db) {
    if (['production', 'test'].includes(process.env.NODE_ENV)) {
      return;
    }
    // Register user model
    const User = UserModel(db);
    // debugger
    return User.createUser({
      name: 'Development',
      email: 'admin',
      password: 'admin',
      super: true
    });
  },

  down: function(action, Sequelize, db) {
    return db.query('DELETE FROM users where email="admin"');
  }
};
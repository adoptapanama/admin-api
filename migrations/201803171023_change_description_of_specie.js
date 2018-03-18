'use strict';

module.exports = {
  up: function(action, Sequelize, db) {
    return db.query('UPDATE species SET description="Felino" where name="Gato"');
  },

  down: function(action, Sequelize, db) {
    return db.query('UPDATE species SET description="Gato" where name="Gato"');
  }
};
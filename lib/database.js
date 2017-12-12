'use strict';
const fs = require('fs');
const Sequelize = require('sequelize');

let sequelize;
let path;

function loadModels() {
  fs.readdirSync(path).forEach((file) => {
    require(`${path}/${file}`)(sequelize);
  });
}

function initializeDB(server) {
  loadModels();
  return new Promise((resolve, reject) => {
    let tryCount = 0;

    async function syncDB(err) {
      tryCount++;

      if (tryCount > 10) {
        server.logger.error('Could not initialize database connection. Exitting now: ' + err.stack);
        return process.exit(1);
      }

      try {
        await sequelize.authenticate();
        return resolve(sequelize.models);
      } catch (e) {
        server.logger.error(e);
        server.logger.error('DB connection failed. Retrying in 10 seconds...');
        return setTimeout(syncDB.bind(this, e), 10000);
      }
    }
    return syncDB();
  });
}

const Database = {
  register: function(server, { config, pathToModels }, next) {

    sequelize = new Sequelize(config.database, config.username, config.password, Object.assign({}, config, {
      dialectOptions: {
        connectTimeout: 20000
      },
      logging: false,
      operatorsAliases: false
    }));

    path = pathToModels;

    server.logger.info('Syncing models...');
    initializeDB(server).then((models) => {
      server.logger.info('Syncing done!');
      server.decorate('server', 'models', models);
      return next();
    }).catch(next);
  },

  loadDb: initializeDB
};

Database.register.attributes = {
  name: 'Database',
  version: '1.0.0'
};

module.exports = Database;
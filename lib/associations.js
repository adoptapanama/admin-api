'use strict';
const fs = require('fs');

const Associations = {
  register: function(server, { pathToModels }, next) {
    server.logger.info('Registering associations...');
    fs.readdirSync(pathToModels).forEach((file) => {
      const association = require(`${pathToModels}/${file}`).register;
      association && association(server.models);
    });

    server.logger.info('Associations done!');
    return next();
  }
};

Associations.register.attributes = {
  name: 'Associations',
  version: '1.0.0'
};

module.exports = Associations;
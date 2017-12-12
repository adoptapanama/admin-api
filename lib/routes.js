'use strict';
const fs = require('fs');

const Routes = {
  register: function(server, { pathToRoutes, cors, security }, next) {
    fs.readdirSync(pathToRoutes).forEach((file) => {
      (require(`${pathToRoutes}/${file}`) || []).forEach((route) => {
        if (server.policies) {
          server.policies.register(route);
        }

        if (security) {
          route.config.security = security;
        }

        server.bind(server);
        server.route(route);
      });
    });
    server.logger.info('Routes loaded!');
    next();
  }
};

Routes.register.attributes = {
  name: 'Routes',
  version: '1.0.0'
};

module.exports = Routes;
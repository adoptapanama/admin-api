'use strict';
if (process.env.NEW_RELIC) {
  require('newrelic');
}

const server = require('./lib/server');
(async () => {
  try {
    await server.start();
    server.server.logger.info('Server up and running at: ' + server.info.uri);
  } catch (err) {
    server.server.logger.error(err.stack);
    process.exit(1);
  }
})();
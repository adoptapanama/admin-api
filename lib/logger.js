'use strict';
const bunyan = require('bunyan');

const Logger = {
  register: function(server, options, next) {
    const log = bunyan.createLogger(options);

    if (process.env.NODE_ENV === 'test') {
      // Stub log functions
      const sinon = require('sinon');
      sinon.stub(log, 'info');
      sinon.stub(log, 'warn');
      sinon.stub(log, 'error');
    }

    server.decorate('server', 'logger', log);
    return next();
  }
};

Logger.register.attributes = {
  name: 'Logger',
  version: '1.0.0'
};

module.exports = Logger;
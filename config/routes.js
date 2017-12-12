'use strict';
const path = require('path');
const Routes = require('../lib/routes');

module.exports = {
  register: Routes,
  options: {
    pathToRoutes: path.normalize(__dirname + '/../routes')
  }
};
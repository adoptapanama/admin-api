'use strict';
const path = require('path');
const Associations = require('../lib/associations');

module.exports = {
  register: Associations,
  options: {
    pathToModels: path.normalize(__dirname + '/../models')
  }
};
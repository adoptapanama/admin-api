'use strict';
const path = require('path');
const Database = require('../lib/database');

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: `${process.env.DB_NAME}${process.env.NODE_ENV === 'test' ? '_test' : ''}`,
  host: process.env.DB_HOST || 'mysql',
  dialect: process.env.DB_DIALECT || 'mysql'
};

module.exports = {
  register: Database,
  options: {
    config,
    pathToModels: path.normalize(__dirname + '/../models')
  }
};
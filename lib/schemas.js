'use strict';
const fs = require('fs');

const SCHEMAS = {};

fs.readdirSync('schemas').forEach((file) => {
  SCHEMAS[file.charAt(0).toUpperCase() + file.slice(1).replace(/\.js$/, '')] = require(`../schemas/${file}`);
});

module.exports = SCHEMAS;
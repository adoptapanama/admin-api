'use strict';
const Joi = require('joi');

const Permission = require('./permission');

module.exports = Joi.array().items(Permission).label('Permissions');
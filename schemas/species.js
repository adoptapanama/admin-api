'use strict';
const Joi = require('joi');
const uuid = require('uuid/v4');

module.exports = Joi.object({
  id: Joi.string().guid().description('Id of the animal').example(uuid()).label('Id'),
  name: Joi.string().required().min(2).max(16).description('Name of the species').example('Dog').label('Name')
}).label('Specie');
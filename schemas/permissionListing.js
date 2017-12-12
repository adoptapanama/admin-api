'use strict';
const Joi = require('joi');
const uuid = require('uuid/v4');

module.exports = Joi.array().items(Joi.object({
  id: Joi.string().guid().description('Permission Id').example(uuid()).label('Permission Id'),
  resource: Joi.string().description('Resource permission gives access to').example('permissions').label('Resource'),
  name: Joi.string().description('Name of the permission given to access the resource').example('list').label('Name')
}).label('PermissionItem')).label('PermissionListing');
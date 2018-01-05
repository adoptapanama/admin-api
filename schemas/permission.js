'use strict';
const Joi = require('joi');

const { PermissionId } = require('./uuid');

module.exports = Joi.object({
  id: PermissionId,
  resource: Joi.string().description('Resource permission gives access to').example('permissions').label('Resource'),
  name: Joi.string().description('Name of the permission given to access the resource').example('list').label('Name')
}).label('Permission');
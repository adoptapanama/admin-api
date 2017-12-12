'use strict';
const Joi = require('joi');
const uuid = require('uuid/v4');

const OrganizationRole = Joi.object({
  id: Joi.string().guid().description('Organization Role Id').example(uuid()).label('Id'),
  role: Joi.string().description('Name of the role').example('Admin User').label('Role'),
  organization: Joi.string().description('Name of the Organization this role applies to').label('Organization')
}).label('OrganizationRole');

module.exports = Joi.array().items(OrganizationRole).label('OrganizationRoles');
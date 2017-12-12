'use strict';
const Joi = require('joi');
const uuid = require('uuid/v4');

module.exports = Joi.array().items(Joi.object({
  id: Joi.string().guid().description('Role Id').example(uuid()).label('Role Id'),
  name: Joi.string().description('Name of the role').example('Organization Admin').label('Role Name'),
  description: Joi.string().description('Description of the role').example('Organization Admin role with invite permissions').label('Role Description')
}).label('RoleListingItem')).label('RoleListing');
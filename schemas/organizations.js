'use strict';
const Joi = require('joi');

const { OrganizationId } = require('./uuid');

module.exports = Joi.object({
  id: OrganizationId,
  name: Joi.string().required().min(2).max(128).description('Name of the organization').example('Organization Example 1').label('Organization Name'),
  description: Joi.string().description('Description of the organization').example('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer suscipit quam quis vestibulum commodo. Nam ac nisl finibus, luctus magna et, fermentum orci. Donec a pellentesque urna, eu tempus orci. ').label('Organization Description'),
  twitter: Joi.string().lowercase().description('Twitter URL').example('https://www.twitter.com/organization/').label('Twitter'),
  facebook: Joi.string().lowercase().description('Facebook URL').example('https://www.facebook.com/organization/').label('Facebook'),
  instagram: Joi.string().lowercase().description('Instagram URL').example('https://www.instagram.com/organization/').label('Instagram')
}).label('Organization');
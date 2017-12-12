'use strict';
const uuid = require('uuid/v4');
const Joi = require('joi');
const moment = require('moment');

const Organization = Joi.string().description('Name of organization to which user belongs').example('Adopta Panama').label('Organization Name');
const Role = Joi.string().description('Name of the role this user has').example('Organization Admin').label('Role Name');

module.exports = Joi.array().items(Joi.object({
  id: Joi.string().guid().description('Id of user').example(uuid()).label('User Id'),
  name: Joi.string().description('Full name of the user').example('John Doe').label('Name'),
  email: Joi.string().email().description('Email address of the user').example('johndoe@example.com').label('Email'),
  lastLogin: Joi.date().description('Last date in which user logged in (a JWT was issued)').example(moment().format()).label('Last Login'),
  super: Joi.boolean().description('User has super admin powers').example(false).label('Super Admin'),
  organizations: Joi.array().items(Organization).example(['Adopta Panama']).label('Organizations'),
  roles: Joi.array().items(Role).example(['Organization Admin']).label('Roles')
}).label('UserListingItem')).label('UserListing');
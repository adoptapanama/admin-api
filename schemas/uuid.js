'use strict';
const Joi = require('joi');
const uuid = require('uuid/v4');

exports.PermissionId = Joi.string().guid().description('Permission Id').example(uuid()).label('Permission Id');
exports.UserOrganizationRoleId = Joi.string().guid().description('User Organization Role Id').example(uuid()).label('UserOrganizationRoleId');
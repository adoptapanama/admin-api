'use strict';
const Joi = require('joi');

const Errors = {};

function validationError(statusCode, type, message, label) {
  return Joi.object().keys({
    statusCode: Joi.number().required().description('HTTP status code').example(statusCode).label('Status Code'),
    error: Joi.string().required().description('Error type').example(type).label('Error type'),
    message: Joi.string().required().description('Description of the error').example(message).label('Description'),
    validation: Joi.object().required().description('Object describing the validation failure').label('Validation Object')
  }).label(label);
}

function boomError(statusCode, name, message, label) {
  return Joi.object().keys({
    statusCode: Joi.number().required().description('HTTP Status Code').example(statusCode).label('Status Code'),
    message: Joi.string().required().description('Description of the error').example(message).label('Error Message'),
    error: Joi.string().required().description('Error name').example(name).label('Error Name')
  }).label(label);
}

function systemError(statusCode, name, message, label) {
  return Joi.object().keys({
    statusCode: Joi.number().required().description('HTTP Status Code').example(statusCode).label('Status Code'),
    message: Joi.string().required().description('Description of the error').example(message).label('Error Message'),
    error: Joi.string().required().description('Error name').example(name).label('Error Name'),
    systemCode: Joi.string().required().description('System Code').example('CONFLICT_DUPLICATE_USER').label('System Code')
  }).label(label);
}

Errors.InternalServerError = boomError(500, 'Internal Server Error', 'An uknown error has occured. Please try again later.', 'InternalServerError');
Errors.AuthenticationError = boomError(401, 'Unauthorized', 'Resource needs authentication', 'AuthenticationError');
Errors.ForbiddenError = boomError(403, 'Forbidden', 'User is not allowed to use resource', 'ForbiddenError');

// Bad Request errors
Errors.BadRequestError = validationError(400, 'Bad Request', 'Some message describing the issue.', 'BadRequestError');
Errors.BadRequestLoginError = validationError(400, 'Bad Request', 'child "email" fails because ["Email" is required]', 'BadRequestLoginError');
Errors.BadRequestOrganizationError = validationError(400, 'Bad Request', 'child "name" fails because ["Name" is required]', 'BadRequestOrganizationError');
Errors.BadRequestUserError = validationError(400, 'Bad Request', 'child "email" fails because ["Email" is required]', 'BadRequestEmailError');
Errors.BadRequestRoleError = validationError(400, 'Bad Request', 'child "name" fails because ["Name" is required]', 'BadRequestRoleError');
Errors.BadRequestSpeciesError = validationError(400, 'Bad Request', 'child "name" fails because ["Name" is required]', 'BadRequestSpeciesError');

// Authentication Errors
Errors.AuthenticationError = boomError(401, 'Unauthorized', 'Resource needs authentication', 'AuthenticationError');

// Forbidden Errors
Errors.ForbiddenError = boomError(403, 'Forbidden', 'User is not allowed to use resource', 'ForbiddenError');

// Not Found Errors
Errors.UserNotFoundError = boomError(404, 'Not Found', 'User not found', 'UserNotFoundError');
Errors.RoleNotFoundError = boomError(404, 'Not Found', 'Role not found', 'RoleNotFoundError');

// Conflict errors
Errors.DuplicateUserError = systemError(409, 'Conflict', 'Email address already used in system', 'DuplicateUserError');

module.exports = Errors;
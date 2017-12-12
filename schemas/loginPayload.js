'use strict';
const Joi = require('joi');

module.exports = Joi.object({
  email: Joi.string().email().required().description('Account Email address').example('user@email.com').label('Email'),
  password: Joi.string().required().description('Account password').example('P4ssw0rd').label('Password')
}).label('LoginPayload');
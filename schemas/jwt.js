'use strict';
const Joi = require('joi');
const moment = require('moment');
const { jwtExpirationDays } = require('../config/server');

module.exports = Joi.object({
  'access_token': Joi.string().description('JWT Token that provides access to private resources').example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ').label('Token'),
  'token_type': Joi.string().description('Token Type').example('Bearer').label('Token Type'),
  'expires_in': Joi.number().description('Unix date in which the token will expire').example(moment().add(jwtExpirationDays, 'days').unix()).label('JWT Expiration Date')
}).label('JWT');
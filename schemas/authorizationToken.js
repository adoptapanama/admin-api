'use strict';
const Joi = require('joi');

module.exports = Joi.object({
  'Authorization': Joi.string().description('JWT Token').example('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ').label('JWT Token'),
  'Device': Joi.string().description('Device this session was initialized for').valid('client', 'mobile').example('client').label('Device')
}).label('Authorization').unknown();
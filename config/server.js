'use strict';
module.exports = {
  apiPrefix: process.env.API_PREFIX || '',
  defaultPort: 3000,
  // hostname to which swagger will make requests (must be in you /etc/hosts)
  devHost: 'local-dev:3000',
  jwtSessionKey: process.env.SERVER_SESSION_KEY,
  jwtExpirationDays: 14,
  sessionSalt: process.env.SESSION_SALT,
  tokenType: 'Bearer',
  maxUploadBytes: 5000000
};
'use strict';
const hapiAuthwt = require('hapi-auth-jwt2');
const moment = require('moment');

const Authentication = {
  register: function(server, { jwtSessionKey, tokenType, sessionSalt }, next) {
    server.logger.info('Loading authentication strategies...');
    server.register(hapiAuthwt, (err) => {
      if (err) {
        return next(err);
      }
      server.auth.strategy('jwt', 'jwt', {
        key: jwtSessionKey,
        validateFunc: async (decoded, { headers }, callback) => {
          if (!decoded.exp || decoded.exp < moment().unix() || !decoded.sub) {
            return callback(null, false);
          }

          const decodedObj = {
            userId: decoded.sub,
            organizationId: decoded.org
          };

          // Authenticate session
          const session = await server.redis.get(`session:${headers.device}:${decoded.sub}`);
          // Check if session is valid
          if (session) {
            const sessionMatch = server.helpers.md5(`${decoded.jti}${sessionSalt}`);
            if (session === sessionMatch) {
              return callback(null, true, decodedObj);
            }
          }
          // If authentication somehow fails from the jwt, close the session
          await server.helpers.closeSession(decoded.sub, headers.device);
          return callback(null, false);
        },
        verifyOptions: {
          algorithms: ['HS256']
        },
        tokenType: tokenType || ''
      });

      server.logger.info('Loading strategies done!');
      return next();
    });
  }
};

Authentication.register.attributes = {
  name: 'Authentication',
  version: '1.0.0'
};

module.exports = Authentication;
'use strict';
require('../testHelpers');
const uuid = require('uuid/v4');
const jwt = require('jsonwebtoken');
const config = require('../../config/server');

let User, UserOrganizationRole;

exports.lab = Lab.script();
const server = Server.server;

describe('Authentication resources', () => {
  let firstOrganization;
  let superUser, userWithMultipleRoles, userWithNoRoles, userWithOneRole;

  before(async () => {
    await Server.initialize();
    ({ User, UserOrganizationRole } = server.models);

    const setup = await createTestSetup();

    [firstOrganization] = setup.organizations;
    [userWithOneRole, superUser, userWithMultipleRoles, userWithNoRoles] = setup.users;
  });

  after(() => {
    return resetTestSetup();
  });

  describe('POST /auth/login', () => {
    before((done) => {
      sinon.spy(server.redis, 'set');
      sinon.spy(server.redis, 'addToSet');
      return done();
    });

    after((done) => {
      server.redis.set.restore();
      server.redis.addToSet.restore();
      return done();
    });

    beforeEach((done) => {
      server.redis.set.reset();
      return done();
    });

    function callServer(email, password, test) {
      return runTest.call(server, {
        method: 'POST',
        url: '/auth/login',
        payload: { email, password },
        headers: {
          'Device': 'client'
        }
      }, test);
    }

    it('should return a 200 and a jwt token if the user logs in correctly and set the session accordingly', () => {
      server.redis.set.reset();
      return callServer(superUser.email, 'testtest', ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal({
          'access_token': result['access_token'],
          'expires_in': result['expires_in'],
          'token_type': 'Bearer'
        });
        const decoded = jwt.verify(result['access_token'], config.jwtSessionKey);
        expect(decoded).to.equal({
          iss: 'Adopta Panamá',
          iat: decoded.iat,
          exp: decoded.exp,
          aud: 'adoptapanama.com',
          sub: superUser.id,
          org: null,
          super: true,
          jti: decoded.jti
        });
        expect(server.redis.set.firstCall.args).to.equal([`session:client:${superUser.id}`, server.helpers.md5(`${decoded.jti}${config.sessionSalt}`)]);
      });
    });

    it('should return a 401 if the user does not exist', () => {
      return callServer('nonexisting@user.com', 'testtest', ({ statusCode, result }) => {
        expect(statusCode).to.equal(401);
        expect(result).to.equal({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid email/password combination',
          systemCode: 'UNAUTHORIZED_INVALID_EMAIL_PASSWORD'
        });
      });
    });

    it('should return a 401 if the user password combination is invalid', () => {
      return callServer(superUser.email, 'invalidpassword', ({ statusCode, result }) => {
        expect(statusCode).to.equal(401);
        expect(result).to.equal({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid email/password combination',
          systemCode: 'UNAUTHORIZED_INVALID_EMAIL_PASSWORD'
        });
      });
    });

    describe.skip('when user fails authentication three times', () => {
      it('should require captcha validation', () => {

      });
    });

    describe('when user is a super user', () => {
      it('should return a jwt token with the super flag set to true', () => {
        return callServer(superUser.email, 'testtest', ({ statusCode, result }) => {
          expect(statusCode).to.equal(200);
          expect(result).to.equal({
            'access_token': result['access_token'],
            'expires_in': result['expires_in'],
            'token_type': 'Bearer'
          });
          const decoded = jwt.verify(result['access_token'], config.jwtSessionKey);
          expect(decoded).to.equal({
            iss: 'Adopta Panamá',
            iat: decoded.iat,
            exp: decoded.exp,
            aud: 'adoptapanama.com',
            sub: superUser.id,
            org: null,
            super: true,
            jti: decoded.jti
          });
        });
      });

      it('should set the session permission only to super', () => {
        return callServer(superUser.email, 'testtest', ({ result }) => {
          const decoded = jwt.verify(result['access_token'], config.jwtSessionKey);
          const signedSuper = server.helpers.md5(`${decoded.jti}super${config.sessionSalt}`);
          expect(server.redis.addToSet.lastCall.args).to.equal([`permissions:client:${superUser.id}`, [signedSuper]]);
        });
      });
    });

    describe('when user has one role', () => {
      it('should return a jwt with the user immediately logged into that role with the role permissions', async () => {
        const [role] = await userWithOneRole.getRoles();
        return callServer(userWithOneRole.email, 'testtest', ({ statusCode, result }) => {
          expect(statusCode).to.equal(200);
          expect(result).to.equal({
            'access_token': result['access_token'],
            'expires_in': result['expires_in'],
            'token_type': 'Bearer'
          });
          const decoded = jwt.verify(result['access_token'], config.jwtSessionKey);
          expect(decoded).to.equal({
            iss: 'Adopta Panamá',
            iat: decoded.iat,
            exp: decoded.exp,
            aud: 'adoptapanama.com',
            sub: userWithOneRole.id,
            org: firstOrganization.id,
            super: false,
            jti: decoded.jti,
            rid: role.userOrganizationRoleId
          });
          const signedPermission = server.helpers.md5(`${decoded.jti}users:list${config.sessionSalt}${firstOrganization.id}`);
          expect(server.redis.addToSet.lastCall.args).to.equal([`permissions:client:${userWithOneRole.id}`, [signedPermission]]);
        });
      });
    });

    describe('when user has multiple roles', () => {
      it('should return a 202 Accepted to signal additional login is required', () => {
        return callServer(userWithMultipleRoles.email, 'testtest', ({ statusCode, result }) => {
          expect(statusCode).to.equal(202);
          expect(result).to.equal({
            'access_token': result['access_token'],
            'expires_in': result['expires_in'],
            'token_type': 'Bearer'
          });
        });
      });

      it('should return a jwt with no organization set and no permissions should be set', () => {
        server.redis.set.reset();
        return callServer(userWithMultipleRoles.email, 'testtest', ({ result }) => {
          const decoded = jwt.verify(result['access_token'], config.jwtSessionKey);
          expect(decoded).to.equal({
            iss: 'Adopta Panamá',
            iat: decoded.iat,
            exp: decoded.exp,
            aud: 'adoptapanama.com',
            sub: userWithMultipleRoles.id,
            org: null,
            super: false,
            jti: decoded.jti
          });
          expect(server.redis.set.callCount).to.equal(1);
        });
      });
    });

    describe('when user has no roles and is not super', () => {
      it('should return a 202 Accepted to signal login details were accepted but an additional step is required', () => {
        return callServer(userWithNoRoles.email, 'testtest', ({ statusCode, result }) => {
          expect(statusCode).to.equal(202);
          expect(result).to.equal({
            'access_token': result['access_token'],
            'expires_in': result['expires_in'],
            'token_type': 'Bearer'
          });
        });
      });

      it('should return a jwt with no organization set and no permissions should be set', () => {
        server.redis.set.reset();
        return callServer(userWithNoRoles.email, 'testtest', ({ result }) => {
          const decoded = jwt.verify(result['access_token'], config.jwtSessionKey);
          expect(decoded).to.equal({
            iss: 'Adopta Panamá',
            iat: decoded.iat,
            exp: decoded.exp,
            aud: 'adoptapanama.com',
            sub: userWithNoRoles.id,
            org: null,
            super: false,
            jti: decoded.jti
          });
          expect(server.redis.set.callCount).to.equal(1);
        });
      });
    });

    describe('when user starts a new session', () => {
      before((done) => {
        sinon.spy(server.redis, 'remove');
        sinon.spy(server.redis, 'expire');
        return done();
      });

      after((done) => {
        server.redis.remove.restore();
        server.redis.expire.restore();
        return done();
      });

      beforeEach((done) => {
        server.redis.remove.reset();
        server.redis.expire.reset();
        return done();
      });

      it('should delete the previous session for the device the session is starting', () => {
        return callServer(superUser.email, 'testtest', () => {
          expect(server.redis.remove.callCount).to.equal(2);
          expect(server.redis.remove.firstCall.args).to.equal([`session:client:${superUser.id}`]);
          expect(server.redis.remove.lastCall.args).to.equal([`permissions:client:${superUser.id}`]);
        });
      });

      it('should set the expiration to 14 days in the future for both session key and permissions', () => {
        const seconds = 14 * 24 * 60 * 60;
        return callServer(superUser.email, 'testtest', () => {
          expect(server.redis.expire.callCount).to.equal(2);
          expect(server.redis.expire.firstCall.args).to.equal([`session:client:${superUser.id}`, seconds]);
          expect(server.redis.expire.lastCall.args).to.equal([`permissions:client:${superUser.id}`, seconds]);
        });
      });
    });

    describe('allowed devices', () => {
      function callServer(device, test) {
        const headers = (device) ? {'Device': device} : undefined;
        return runTest({
          method: 'POST',
          url: '/auth/login',
          payload: {
            email: 'super@user.com',
            password: 'testtest'
          },
          headers
        }, test);
      }
      it('should return a 400 if no device is sent in the header', () => {
        return callServer(null, ({ statusCode, result }) => {
          expect(statusCode).to.equal(400);
          expect(result).to.equal({
            error: 'Bad Request',
            message: 'No device sent in headers.',
            statusCode: 400
          });
        });
      });

      it('should return a 400 if an invalid device is sent in the header', () => {
        return callServer('invalid', ({ statusCode, result }) => {
          expect(statusCode).to.equal(400);
          expect(result).to.equal({
            error: 'Bad Request',
            message: 'Invalid device sent in headers.',
            statusCode: 400
          });
        });
      });

      it('should allow for mobile devices', () => {
        return callServer('mobile', ({ statusCode }) => {
          expect(statusCode).to.equal(200);
        });
      });

      it('should allow for client devices', () => {
        return callServer('client', ({ statusCode }) => {
          expect(statusCode).to.equal(200);
        });
      });
    });

    it('should return a 500 if an unknown error occurs', () => {
      sinon.stub(User, 'getUserByEmail').returns(Promise.reject('some error'));
      return callServer(superUser.email, 'testtest', ({ statusCode, result }) => {
        User.getUserByEmail.restore();
        expect(statusCode).to.equal(500);
        expect(result).to.equal({
          error: 'Internal Server Error',
          statusCode: 500,
          message: 'An internal server error occurred'
        });
      });
    });
  });

  describe('GET /auth/roles', () => {
    function callServer(token, test) {
      return runTest({
        method: 'GET',
        url: '/auth/roles',
        headers: {
          'Authorization': token,
          'Device': 'client'
        }
      }, test);
    }

    it('should return a list of roles a user has in the system', async () => {
      const jwt = await logIn(userWithMultipleRoles);
      return callServer(jwt, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: result[0].id,
          name: 'Test Role',
          organization: 'First Organization'
        }, {
          id: result[1].id,
          name: 'Test Role',
          organization: 'Second Organization'
        }]);
      });
    });

    it('if the user has no roles in the system, it should return empty', async () => {
      const jwt = await logIn(userWithNoRoles);
      return callServer(jwt, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([]);
      });
    });

    it('should return a 401 if the session is not valid', async () => {
      const jwt = await logIn(userWithNoRoles);
      await server.helpers.closeSession(userWithNoRoles.id, 'client');
      return callServer(jwt, ({ statusCode, result }) => {
        expect(statusCode).to.equal(401);
        expect(result).to.equal({
          error: 'Unauthorized',
          statusCode: 401,
          message: 'Invalid credentials',
          attributes: {
            error: 'Invalid credentials'
          }
        });
      });
    });

    it('should return a 500 if an unknown error occurs', async () => {
      const jwt = await logIn(userWithNoRoles);
      sinon.stub(User, 'getUser').returns(Promise.reject('some error'));
      return callServer(jwt, ({ statusCode, result }) => {
        User.getUser.restore();
        expect(statusCode).to.equal(500);
        expect(result).to.equal({
          error: 'Internal Server Error',
          statusCode: 500,
          message: 'An internal server error occurred'
        });
      });
    });
  });

  describe('GET /auth/roles/{organizationRoleId}', () => {
    let roleId;

    before(async () => {
      const roles = await userWithMultipleRoles.getRoles();
      roleId = roles[0].userOrganizationRoleId;
    });

    function callServer(userOrganizationRoleId, token, test) {
      return runTest({
        method: 'GET',
        url: `/auth/roles/${userOrganizationRoleId}`,
        headers: {
          'Authorization': token,
          'Device': 'client'
        }
      }, test);
    }

    it('should close the session and return a 401 if the role given does not exist', async () => {
      const jwt = await logIn(userWithMultipleRoles);
      return callServer(uuid(), jwt, ({ statusCode, result }) => {
        expect(statusCode).to.equal(401);
        expect(result).to.equal({
          error: 'Unauthorized',
          statusCode: 401,
          message: 'Invalid role selected',
          systemCode: 'UNAUTHORIZED_INVALID_ROLE'
        });
      });
    });

    it('should close the session and return a 401 if the role given does not belong to the user', async () => {
      const jwt = await logIn(userWithMultipleRoles);
      const otherRoles = await userWithOneRole.getRoles();

      return callServer(otherRoles[0].userOrganizationRoleId, jwt, ({ statusCode, result }) => {
        expect(statusCode).to.equal(401);
        expect(result).to.equal({
          error: 'Unauthorized',
          statusCode: 401,
          message: 'Invalid role selected',
          systemCode: 'UNAUTHORIZED_INVALID_ROLE'
        });
      });
    });

    it('should return a new jwt, close the previous session, start a new one, and set the new role permissions', async () => {
      const token = await logIn(userWithMultipleRoles);
      sinon.spy(server.redis, 'set');
      sinon.spy(server.redis, 'addToSet');
      sinon.spy(server.redis, 'remove');

      return callServer(roleId, token, ({ statusCode, result}) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal({
          'access_token': result['access_token'],
          'expires_in': result['expires_in'],
          'token_type': 'Bearer'
        });
        const decoded = jwt.verify(result['access_token'], config.jwtSessionKey);
        expect(decoded).to.equal({
          iss: 'Adopta Panamá',
          iat: decoded.iat,
          exp: decoded.exp,
          aud: 'adoptapanama.com',
          sub: userWithMultipleRoles.id,
          org: firstOrganization.id,
          super: false,
          jti: decoded.jti,
          rid: roleId
        });
        const signedPermission = server.helpers.md5(`${decoded.jti}users:list${config.sessionSalt}${firstOrganization.id}`);
        expect(server.redis.addToSet.lastCall.args).to.equal([`permissions:client:${userWithMultipleRoles.id}`, [signedPermission]]);

        expect(server.redis.set.firstCall.args).to.equal([`session:client:${userWithMultipleRoles.id}`, server.helpers.md5(`${decoded.jti}${config.sessionSalt}`)]);
        expect(server.redis.remove.callCount).to.equal(2);
        expect(server.redis.remove.firstCall.args).to.equal([`session:client:${userWithMultipleRoles.id}`]);
        expect(server.redis.remove.lastCall.args).to.equal([`permissions:client:${userWithMultipleRoles.id}`]);

        server.redis.set.restore();
        server.redis.addToSet.restore();
        server.redis.remove.restore();
      });
    });

    it('should return a 401 if the session is not valid', async () => {
      const jwt = await logIn(userWithMultipleRoles);
      await server.helpers.closeSession(userWithMultipleRoles.id, 'client');
      return callServer(roleId, jwt, ({ statusCode, result }) => {
        expect(statusCode).to.equal(401);
        expect(result).to.equal({
          error: 'Unauthorized',
          statusCode: 401,
          message: 'Invalid credentials',
          attributes: {
            error: 'Invalid credentials'
          }
        });
      });
    });

    it('should return a 500 if an unknown error occurs', async () => {
      const jwt = await logIn(userWithNoRoles);
      sinon.stub(UserOrganizationRole, 'getRecord').returns(Promise.reject('some error'));
      return callServer(roleId, jwt, ({ statusCode, result }) => {
        UserOrganizationRole.getRecord.restore();
        expect(statusCode).to.equal(500);
        expect(result).to.equal({
          error: 'Internal Server Error',
          statusCode: 500,
          message: 'An internal server error occurred'
        });
      });
    });
  });
});
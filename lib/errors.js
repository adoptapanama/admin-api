'use strict';
const Boom = require('boom');
const errorFactory = require('error-factory');

function setBoomErrors(codes) {
  const errors = {};
  const boomTypes = {
    'FORBIDDEN': Boom.forbidden,
    'NOTFOUND': Boom.notFound,
    'UNAUTHORIZED': Boom.unauthorized,
    'CONFLICT': Boom.conflict
  };

  for (const idx in codes) {
    if (errors[idx]) {
      throw Error(`Duplicate code ${idx} in statusCodes`);
    }
    const errorType = idx.split('_', 1);
    errors[idx] = boomTypes[errorType](codes[idx]);
    errors[idx].output.payload.systemCode = idx;
  }

  return errors;
};

const statusCodes = {
  'FORBIDDEN_USER_MUST_BE_SUPER': 'Only system administrators have access to this resource',
  'FORBIDDEN_USER_NOT_ALLOWED': 'User is not allowed this resource.',
  'CONFLICT_DUPLICATE_USER': 'Email address already used in system',
  'UNAUTHORIZED_USER_ACCOUNT_SUSPENDED': 'User account has been suspended',
  'UNAUTHORIZED_SESSION_ERROR': 'There was an error with your session. Please try logging in again.',
  'UNAUTHORIZED_INVALID_EMAIL_PASSWORD': 'Invalid email/password combination',
  'UNAUTHORIZED_INVALID_ROLE': 'Invalid role selected',
  'NOTFOUND_USER_NOT_FOUND': 'User not found'
};

const Errors = {};

Errors.SystemCodes = setBoomErrors(statusCodes);

function factoryErrors(name, statusCode) {
  return errorFactory(name, {
    message: statusCodes[statusCode],
    code: statusCode
  });
}

Object.assign(Errors, {
  BadRequestError: errorFactory('BadRequestError', {
    message: 'Bad Request'
  }),
  DuplicateUserError: factoryErrors('DuplicateUserError', 'CONFLICT_DUPLICATE_USER'),
  UserNotFoundError: factoryErrors('UserNotFoundError', 'NOTFOUND_USER_NOT_FOUND'),
  UserNotAllowedError: factoryErrors('UserNotAllowedError', 'FORBIDDEN_USER_NOT_ALLOWED'),
  InvalidEmailPasswordError: factoryErrors('InvalidEmailPasswordError', 'UNAUTHORIZED_INVALID_EMAIL_PASSWORD'),
  InvalidRoleError: factoryErrors('InvalidRoleError', 'UNAUTHORIZED_INVALID_ROLE')
});

module.exports = Errors;
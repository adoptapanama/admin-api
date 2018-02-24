'use strict';
const crypto = require('crypto');
const Sequelize = require('sequelize');
const Helpers = require('../lib/helpers').fn;

function passwordHash(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

module.exports = function(db) {
  const User = db.define('User', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(256),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(256),
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING(128),
      allowNull: false,
      set: function(value) {
        const salt = Helpers.createRandomBytes(16);
        this.setDataValue('salt', salt);
        const password = passwordHash(value, salt);
        return this.setDataValue('password', password);
      }
    },
    salt: {
      type: Sequelize.STRING(32),
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING(32),
      allowNull: true
    },
    super: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'users'
  });

  // Instance methods
  User.prototype.isSuper = function() {
    return this.super === true;
  };

  User.prototype.isPasswordValid = function(password) {
    return this.password === passwordHash(password, this.salt);
  };

  User.prototype.addRole = async function(role = {}, organization = {}) {
    await this.sequelize.models.UserOrganizationRole.createRecord(this, role, organization);
    return this.getRoles();
  };

  User.prototype.getRoles = async function() {
    const roles = await this.sequelize.models.UserOrganizationRole.getUserRoles(this);
    this.roles = roles;
    return roles;
  };

  User.prototype.removeRole = function(role = {}, organization = {} ) {
    return this.sequelize.models.UserOrganizationRole.removeRoleFromUser(this.id, role.id, organization.id);
  };

  // Static Methos
  User.createUser = function({ name, email, password, phone, super: superUser}) {
    return this.create({
      name,
      email,
      password,
      phone,
      super: superUser || false
    });
  };

  User.getUser = function(id) {
    return this.findOne({
      where: { id }
    });
  };

  User.getUserByEmail = function(email) {
    return this.findOne({
      where: { email }
    });
  };

  return User;
};

module.exports.register = function({ User, UserOrganizationRole }) {
  User.hasMany(UserOrganizationRole, {as: 'organizationRoles', foreignKey: 'userId'});
};
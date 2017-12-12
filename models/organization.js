'use strict';
const Sequelize = require('sequelize');

module.exports = function(db) {
  const Organization = db.define('Organization', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(128),
      allowNull: false
    },
    description: {
      type: Sequelize.STRING(256),
      allowNull: true
    }
  }, {
    tableName: 'organizations'
  });
  // Instance Methods

  // Static Methods
  Organization.createOrganization = function(name, description) {
    return this.create({ name, description });
  };

  return Organization;
};

module.exports.register = function({ Organization, UserOrganizationRole }) {
  Organization.hasMany(UserOrganizationRole, { as: 'organizationRoles', foreignKey: 'organizationId'});
};
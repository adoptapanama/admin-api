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
    },
    twitter: {
      type: Sequelize.STRING(256),
      allowNull: true
    },
    facebook: {
      type: Sequelize.STRING(256),
      allowNull: true
    },
    instagram: {
      type: Sequelize.STRING(256),
      allowNull: true
    }
  }, {
    tableName: 'organizations'
  });
  // Instance Methods

  // Static Methods
  Organization.createOrganization = function(name, description, twitter, facebook, instagram) {
    return this.create({ name, description, twitter, facebook, instagram });
  };

  Organization.listOrganizations = function() {
    return this.findAll({
      order: [['name', 'ASC']]
    });
  };

  Organization.getOrganizationByName = function(name) {
    return this.findOne({
      where: { name }
    });
  };
  //Get Specific
  Organization.getOrganizationByID = function(id,name){
    return this.findOne({
      where: {id}
    });
  };
    //End Get specific
  return Organization;
};

module.exports.register = function({ Organization, UserOrganizationRole }) {
  Organization.hasMany(UserOrganizationRole, { as: 'organizationRoles', foreignKey: 'organizationId'});
};
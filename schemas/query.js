'use strict';

const Joi = require('joi');

module.exports = Joi.object({
  q: Joi.string().description('The term to search for in the database').example('John Doe').label('Query'),
  count: Joi.number().integer().description('The amount of items to return per page').example(10).label('Count'),
  cursor: Joi.number().integer().description('The point at the results from where to start the count').example(10).label('Cursor'),
  sort: Joi.string().description('Field by which to sort the results').example('name').label('Sort by'),
  order: Joi.string().description('Sorting order').allow('asc', 'desc').example('asc').label('Sorting order')
}).label('Query');
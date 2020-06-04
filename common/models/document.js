'use strict';

const ScicatService = require('../scicat.service');
const scicatPublishedDataService = new ScicatService.PublishedData();

module.exports = function (Document) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Document.find = async function (filter) {
    return scicatPublishedDataService.find(filter);
  };

  /**
   * Find a model instance by {{id}} from the data source.
   * @param {string} id Model id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Document.findById = async function (id, filter) {
    return scicatPublishedDataService.findById(id, filter);
  };

  /**
   * Count instances of the model matched by where from the data source.
   * @param {object} where Criteria to match model instances
   */

  Document.count = async function (where) {
    return scicatPublishedDataService.count(where);
  };
};

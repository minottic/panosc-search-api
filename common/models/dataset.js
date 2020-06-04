'use strict';

const ScicatService = require('../scicat.service');
const scicatDatasetService = new ScicatService.Dataset();

module.exports = function (Dataset) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.find = async function (filter) {
    return scicatDatasetService.find(filter);
  };

  /**
   * Find a model instance by {{id}} from the data source.
   * @param {string} id Model id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findById = async function (id, filter) {
    return scicatDatasetService.findById(id, filter);
  };

  /**
   * Queries files of Dataset.
   * @param {string} id Dataset id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findByIdFiles = async function (id, filter) {
    return scicatDatasetService.findByIdFiles(id, filter);
  };

  /**
   * Count instances of the model matched by where from the data source.
   * @param {object} where Criteria to match model instances
   */

  Dataset.count = async function (where) {
    return scicatDatasetService.count(where);
  };

  /**
   * Counts files of Dataset.
   * @param {string} id Dataset id
   * @param {object} where Criteria to match model instances
   */

  Dataset.countFiles = async function (id, where) {
    return scicatDatasetService.countFiles(id, where);
  };
};

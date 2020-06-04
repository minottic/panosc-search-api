'use strict';

const ScicatService = require('../scicat.service');
const scicatDatasetService = new ScicatService.Dataset();

const ResponseMapper = require('../response-mapper');
const responseMapper = new ResponseMapper();

module.exports = function (Dataset) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.find = async function (filter) {
    try {
      const datasets = await scicatDatasetService.find(filter);
      return datasets.map((dataset) => responseMapper.dataset(dataset));
    } catch (err) {
      return err;
    }
  };

  /**
   * Find a model instance by {{id}} from the data source.
   * @param {string} id Model id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findById = async function (id, filter) {
    try {
      const dataset = await scicatDatasetService.findById(id, filter);
      return responseMapper.dataset(dataset);
    } catch (err) {
      return err;
    }
  };

  /**
   * Queries files of Dataset.
   * @param {string} id Dataset id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findByIdFiles = async function (id, filter) {
    try {
      const origDatablocks = await scicatDatasetService.findByIdFiles(
        id,
        filter,
      );
      return responseMapper.files(origDatablocks);
    } catch (err) {
      return err;
    }
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

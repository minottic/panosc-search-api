'use strict';

module.exports = function (Dataset) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.find = async function (filter) {
    try {
      return await new Promise((resolve, reject) => {
        return resolve([
          {
            pid: 'testPID',
            title: 'Test Dataset',
            isPublic: true,
            creationDate: new Date(),
          },
        ]);
      });
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Find a model instance by {{id}} from the data source.
   * @param {string} id Model id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findById = async function (id, filter) {
    try {
      return await new Promise((resolve, reject) => {
        return resolve({
          pid: 'testPID',
          title: 'Test Dataset',
          isPublic: true,
          creationDate: new Date(),
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Queries files of Dataset.
   * @param {string} id Dataset id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findByIdFiles = async function (id, filter) {
    try {
      return await new Promise((resolve, reject) => {
        return resolve([
          {
            id: 'testID',
            name: 'Test Filename',
          },
        ]);
      });
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Count instances of the model matched by where from the data source.
   * @param {object} where Criteria to match model instances
   */

  Dataset.count = async function (where) {
    try {
      return await new Promise((resolve, reject) => {
        return resolve({count: 0});
      });
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Counts files of Dataset.
   * @param {string} id Dataset id
   * @param {object} where Criteria to match model instances
   */

  Dataset.countFiles = async function (id, where) {
    try {
      return await new Promise((resolve, reject) => {
        return resolve({count: 0});
      });
    } catch (err) {
      console.error(err);
    }
  };
};

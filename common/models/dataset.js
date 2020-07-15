'use strict';

const ScicatService = require('../scicat-service');
const scicatDatasetService = new ScicatService.Dataset();

const filterMapper = require('../filter-mapper');
const responseMapper = require('../response-mapper');
const utils = require('../utils');

module.exports = function (Dataset) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.find = async function (filter) {
    try {
      const scicatFilter = filterMapper.dataset(filter);
      const datasets = await scicatDatasetService.find(scicatFilter);
      return await Promise.all(
        datasets.map(
          async (dataset) => await responseMapper.dataset(dataset, filter),
        ),
      );
    } catch (err) {
      throw err;
    }
  };

  /**
   * Find a model instance by {{id}} from the data source.
   * @param {string} id Model id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findById = async function (id, filter) {
    try {
      const scicatFilter = filterMapper.dataset(filter);
      const dataset = await scicatDatasetService.findById(id, scicatFilter);
      console.log('dataset before map', dataset);
      return await responseMapper.dataset(dataset, filter);
    } catch (err) {
      throw err;
    }
  };

  /**
   * Count instances of the model matched by where from the data source.
   * @param {object} where Criteria to match model instances
   */

  Dataset.count = async function (where) {
    try {
      const scicatFilter = filterMapper.dataset({where});
      return await scicatDatasetService.count(scicatFilter);
    } catch (err) {
      throw err;
    }
  };

  /**
   * Queries files of Dataset.
   * @param {string} id Dataset id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findByIdFiles = async function (id, filter) {
    try {
      const scicatFilter = filterMapper.files(filter);
      const origDatablocks = await scicatDatasetService.findByIdFiles(
        id,
        scicatFilter,
      );
      return responseMapper.files(origDatablocks);
    } catch (err) {
      throw err;
    }
  };

  /**
   * Counts files of Dataset.
   * @param {string} id Dataset id
   * @param {object} where Criteria to match model instances
   */

  Dataset.countFiles = async function (id, where) {
    try {
      const scicatFilter = filterMapper.files({where});
      const origDatablocks = await scicatDatasetService.findByIdFiles(
        id,
        scicatFilter,
      );
      const files = responseMapper.files(origDatablocks);
      return {count: files.length};
    } catch (err) {
      throw err;
    }
  };

  Dataset.afterRemote('find', (ctx, result, next) => {
    const filter = ctx.args.filter ? ctx.args.filter : {};
    const primaryRelations = utils.getPrimaryRelations(filter);
    const secondaryRelations = utils.getSecondaryRelations(
      primaryRelations,
      filter,
    );

    if (primaryRelations.length > 0) {
      primaryRelations.forEach((primary) => {
        if (
          secondaryRelations[primary] &&
          secondaryRelations[primary].length > 0
        ) {
          secondaryRelations[primary].forEach((secondary) => {
            ctx.result = utils.filterOnSecondary(
              ctx.result,
              primary,
              secondary,
            );
          });
        } else {
          ctx.result = utils.filterOnPrimary(ctx.result, primary);
        }
      });
    }

    ctx.result.forEach((instance) => {
      instance.score = 0;
    });

    next();
  });
};

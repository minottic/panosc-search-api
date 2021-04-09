"use strict";

const ScicatService = require("../scicat-service");
const errors = require('../errors')
const scicatDatasetService = new ScicatService.Dataset();

const filterMapper = require("../filter-mapper");
const responseMapper = require("../response-mapper");
const utils = require("../utils");

module.exports = function (Dataset) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.find = async function (filter) {
    const scicatFilter = filterMapper.dataset(filter);
    const datasets = await scicatDatasetService.find(scicatFilter);
    return await Promise.all(
      datasets.map(
        async (dataset) => await responseMapper.dataset(dataset, filter),
      ),
    );
  };


  Dataset.afterRemote("find", async function (ctx, datasets, next) {
    ctx.result = await Promise.all(
      datasets.map(
        async dataset => {
          return dataset.catch(e => { if (!(Object.values(errors).some(err => e instanceof err))) { throw e } })
        }
      )).then(value => value.filter(v => v));
    next();
  });


  /**
   * Find a model instance by {{id}} from the data source.
   * @param {string} id Model id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findById = async function (id, filter) {
    const scicatFilter = filterMapper.dataset(filter);
    const dataset = await scicatDatasetService.findById(id, scicatFilter);
    return await responseMapper.dataset(dataset, filter);
  };

  /**
   * Count instances of the model matched by where from the data source.
   * @param {object} where Criteria to match model instances
   */

  Dataset.count = async function (where) {
    const scicatFilter = filterMapper.dataset({ where });
    return await scicatDatasetService.count(scicatFilter);
  };

  /**
   * Queries files of Dataset.
   * @param {string} id Dataset id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Dataset.findByIdFiles = async function (id, filter) {
    const scicatFilter = filterMapper.files(filter);
    const origDatablocks = await scicatDatasetService.findByIdFiles(
      id,
      scicatFilter,
    );
    return responseMapper.files(origDatablocks);
  };

  /**
   * Counts files of Dataset.
   * @param {string} id Dataset id
   * @param {object} where Criteria to match model instances
   */

  Dataset.countFiles = async function (id, where) {
    const scicatFilter = filterMapper.files({ where });
    const origDatablocks = await scicatDatasetService.findByIdFiles(
      id,
      scicatFilter,
    );
    const files = responseMapper.files(origDatablocks);
    return { count: files.length };
  };

  Dataset.afterRemote("find", (ctx, result, next) => {
    const filter = ctx.args.filter ? ctx.args.filter : {};
    const inclusions = utils.getInclusionNames(filter);

    if (Object.keys(inclusions).length > 0) {
      Object.keys(inclusions).forEach((primary) => {
        if (inclusions[primary] && inclusions[primary].length > 0) {
          inclusions[primary].forEach((secondary) => {
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

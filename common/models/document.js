"use strict";

const ScicatService = require("../scicat-service");
const scicatPublishedDataService = new ScicatService.PublishedData();

const filterMapper = require("../filter-mapper");
const responseMapper = require("../response-mapper");
const utils = require("../utils");

module.exports = function (Document) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Document.find = async function (filter) {
    const scicatFilter = filterMapper.document(filter);
    const publishedData = await scicatPublishedDataService.find(scicatFilter);
    return await Promise.all(
      publishedData.map(
        async (data) => await responseMapper.document(data, filter),
      ),
    );
  };

  /**
   * Find a model instance by {{id}} from the data source.
   * @param {string} id Model id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Document.findById = async function (id, filter) {
    const scicatFilter = filterMapper.document(filter);
    const publishedData = await scicatPublishedDataService.findById(
      id,
      scicatFilter,
    );
    return await responseMapper.document(publishedData, filter);
  };

  /**
   * Count instances of the model matched by where from the data source.
   * @param {object} where Criteria to match model instances
   */

  Document.count = async function (where) {
    const scicatFilter = filterMapper.document({ where });
    return await scicatPublishedDataService.count(scicatFilter.where);
  };

  Document.afterRemote("find", (ctx, result, next) => {
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

"use strict";

const ScicatService = require("../scicat-service");
const scicatInstrumentService = new ScicatService.Instrument();

const filterMapper = require("../filter-mapper");
const responseMapper = require("../response-mapper");
const utils = require("../utils");

module.exports = function (Instrument) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Instrument.find = async function (filter) {
    const scicatFilter = filterMapper.instrument(filter);
    const instruments = await scicatInstrumentService.find(scicatFilter);
    return instruments.map((instrument) =>
      responseMapper.instrument(instrument),
    );
  };

  /**
   * Find a model instance by {{id}} from the data source.
   * @param {string} id Model id
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Instrument.findById = async function (id, filter) {
    const scicatFilter = filterMapper.instrument(filter);
    const instrument = await scicatInstrumentService.findById(id, scicatFilter);
    return responseMapper.instrument(instrument);
  };

  /**
   * Count instances of the model matched by where from the data source.
   * @param {object} where Criteria to match model instances
   */

  Instrument.count = async function (where) {
    const scicatFilter = filterMapper.instrument({ where });
    return await scicatInstrumentService.count(scicatFilter.where);
  };

  Instrument.afterRemote("find", (ctx, result, next) => {
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

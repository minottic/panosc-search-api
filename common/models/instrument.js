'use strict';

const ScicatService = require('../scicat-service');
const scicatInstrumentService = new ScicatService.Instrument();

const filterMapper = require('../filter-mapper');
const responseMapper = require('../response-mapper');
const utils = require('../utils');

module.exports = function (Instrument) {
  /**
   * Find all instances of the model matched by filter from the data source.
   * @param {object} filter Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"where":{"something":"value"}}). See https://loopback.io/doc/en/lb3/Querying-data.html#using-stringified-json-in-rest-queries for more details.
   */

  Instrument.find = async function (filter) {
    try {
      const scicatFilter = filterMapper.instrument(filter);
      const instruments = await scicatInstrumentService.find(scicatFilter);
      return instruments.map((instrument) =>
        responseMapper.instrument(instrument),
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

  Instrument.findById = async function (id, filter) {
    try {
      const scicatFilter = filterMapper.instrument(filter);
      const instrument = await scicatInstrumentService.findById(
        id,
        scicatFilter,
      );
      return responseMapper.instrument(instrument);
    } catch (err) {
      throw err;
    }
  };

  /**
   * Count instances of the model matched by where from the data source.
   * @param {object} where Criteria to match model instances
   */

  Instrument.count = async function (where) {
    try {
      const scicatFilter = filterMapper.instrument({where});
      return await scicatInstrumentService.count(scicatFilter.where);
    } catch (err) {
      throw err;
    }
  };

  Instrument.afterRemote('find', (ctx, result, next) => {
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

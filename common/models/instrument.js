'use strict';

const ScicatService = require('../scicat.service');
const scicatInstrumentService = new ScicatService.Instrument();

const filterMapper = require('../filter-mapper');
const responseMapper = require('../response-mapper');

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
    return scicatInstrumentService.count(where);
  };
};

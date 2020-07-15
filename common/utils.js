'use strict';

const math = require('mathjs');

/**
 * Get inclusions from filter
 * @param {object} filter PaNOSC loopback filter object
 * @returns {object} Object with primary relation as key and loopback filter object as value
 */

exports.getInclusions = (filter) =>
  filter && filter.include
    ? Object.assign(
        ...filter.include.map((inclusion) =>
          inclusion.scope
            ? {[inclusion.relation]: inclusion.scope}
            : {[inclusion.relation]: {}},
        ),
      )
    : {};

/**
 * Get names of inclusions from filter
 * @param {object} filter PaNOSC loopBack filter object
 * @returns {object} Object with primary relation as key and and an array of secondary relations as value
 */

exports.getInclusionNames = (filter) =>
  filter && filter.include
    ? Object.assign(
        ...filter.include
          .filter(
            (primary) =>
              (primary.scope && primary.scope.where) ||
              (primary.scope && primary.scope.include),
          )
          .map((inclusion) =>
            inclusion.scope && inclusion.scope.include
              ? {
                  [inclusion.relation]: inclusion.scope.include
                    .filter(
                      (secondary) => secondary.scope && secondary.scope.where,
                    )
                    .map(({relation}) => relation),
                }
              : {[inclusion.relation]: []},
          ),
      )
    : {};

/**
 * Filter result on primary relation
 * @param {object[]} result The result from the LoopBack query
 * @param {string} primary Name of the primary relation
 * @returns {object[]} Sanitized result
 */

exports.filterOnPrimary = (result, primary) =>
  result.filter((item) =>
    Array.isArray(item[primary])
      ? item[primary].length > 0
      : Object.keys(item[primary]).length > 0,
  );

/**
 * Filter result on secondary relation
 * @param {object[]} result The result from the LoopBack query
 * @param {string} primary Name of the primary relation
 * @param {string} secondary Name of the secondary relation
 * @returns {object[]} Sanitized result
 */

exports.filterOnSecondary = (result, primary, secondary) =>
  result.filter((item) =>
    Array.isArray(item[primary])
      ? (item[primary] =
          item[primary].filter((child) =>
            Array.isArray(child[secondary])
              ? child[secondary].length > 0
              : Object.keys(child[secondary]).length > 0,
          ).length > 0
            ? item[primary].filter((child) =>
                Array.isArray(child[secondary])
                  ? child[secondary].length > 0
                  : Object.keys(child[secondary]).length > 0,
              )
            : null)
      : Object.keys(item[primary]).length > 0 &&
        item[primary].filter((child) =>
          Array.isArray(child[secondary])
            ? child[secondary].length > 0
            : Object.keys(child[secondary]).length > 0,
        ).length > 0,
  );

/**
 * Convert a quantity to SI units
 * @param {number} value Value to be converted
 * @param {string} unit Unit to be converted
 * @returns {object} Object with with the converted value as `valueSI` and the converted unit as `unitSI`
 */

exports.convertToSI = (value, unit) => {
  const quantity = math.unit(value, unit).toSI().toString();
  const convertedValue = quantity.substring(0, quantity.indexOf(' '));
  const convertedUnit = quantity.substring(quantity.indexOf(' ') + 1);
  return {valueSI: Number(convertedValue), unitSI: convertedUnit};
};

/**
 * Convert a quantity to another unit
 * @param {number} value Value to be converted
 * @param {string} unit Unit to be converted
 * @param {string} toUnit Unit the quantity should be converted to
 * @returns {object} Object with the converted value and unit
 */

exports.convertToUnit = (value, unit, toUnit) => {
  const converted = math.unit(value, unit).to(toUnit);
  const formatted = math.format(converted, {precision: 3}).toString();
  const formattedValue = formatted.substring(0, formatted.indexOf(' '));
  const formattedUnit = formatted.substring(formatted.indexOf(' ') + 1);
  return {value: Number(formattedValue), unit: formattedUnit};
};

/**
 * Extracts the name, value and unit from parameter where filter
 * @param {object} where PaNOSC parameter where filter object
 * @returns {object} Object with the extracted name, value and unit
 */

exports.extractParamaterFilter = (where) => {
  if (where && where.and) {
    const name = where.and.find((condition) =>
      Object.keys(condition).includes('name'),
    )
      ? where.and.find((condition) => Object.keys(condition).includes('name'))[
          'name'
        ]
      : null;
    const value = where.and.find((condition) =>
      Object.keys(condition).includes('value'),
    )
      ? where.and.find((condition) => Object.keys(condition).includes('value'))[
          'value'
        ]
      : null;
    const unit = where.and.find((condition) =>
      Object.keys(condition).includes('unit'),
    )
      ? where.and.find((condition) => Object.keys(condition).includes('unit'))[
          'unit'
        ]
      : null;
    return {name, value, unit};
  } else {
    return {name: null, value: null, unit: null};
  }
};

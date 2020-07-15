'use strict';

const math = require('mathjs');

/**
 * Get primary relations from filter
 * @param {string} filter LoopBack filter object
 * @returns {string[]} Array of primary relations
 */

exports.getPrimaryRelations = (filter) =>
  filter.include
    ? filter.include
        .filter(
          (primary) =>
            (primary.scope && primary.scope.where) ||
            (primary.scope && primary.scope.include),
        )
        .map(({relation}) => relation)
    : [];

/**
 * Get secondary relations from filter
 * @param {string[]} primaryRelations Array of primary relations
 * @param {string} filter LoopBack filter object
 * @returns {object} Object with primary relation as key and and an array of secondary relations as value
 */

exports.getSecondaryRelations = (primaryRelations, filter) =>
  primaryRelations.length > 0 &&
  filter.include.filter(
    (inclusion) => inclusion.scope && inclusion.scope.include,
  ).length > 0
    ? Object.assign(
        ...primaryRelations.map((primary) => ({
          [primary]: [].concat.apply(
            [],
            filter.include.map((inclusion) =>
              inclusion.relation === primary &&
              inclusion.scope &&
              inclusion.scope.include
                ? inclusion.scope.include
                    .filter(
                      (secondary) => secondary.scope && secondary.scope.where,
                    )
                    .map(({relation}) => relation)
                : [],
            ),
          ),
        })),
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

exports.convertToSI = (value, unit) => {
  const quantity = math.unit(value, unit).toSI().toString();
  const convertedValue = quantity.substring(0, quantity.indexOf(' '));
  const convertedUnit = quantity.substring(quantity.indexOf(' ') + 1);
  return {valueSI: Number(convertedValue), unitSI: convertedUnit};
};

exports.convertToUnit = (value, unit, toUnit) => {
  const converted = math.unit(value, unit).to(toUnit);
  const formatted = math.format(converted, {precision: 3}).toString();
  const formattedValue = formatted.substring(0, formatted.indexOf(' '));
  const formattedUnit = formatted.substring(formatted.indexOf(' ') + 1);
  return {value: Number(formattedValue), unit: formattedUnit};
};

exports.extractParamater = (where) => {
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
};

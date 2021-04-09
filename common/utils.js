"use strict";

const errors = require('./errors')
const math = require("mathjs");
const { writeErrorToResponse } = require("strong-error-handler");

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
          ? { [inclusion.relation]: inclusion.scope }
          : { [inclusion.relation]: {} },
      ),
    )
    : {};

/**
 * Get names of inclusions from filter
 * @param {object} filter PaNOSC loopBack filter object
 * @returns {object} Object with primary relation as key and and an array of secondary relations as value
 */

exports.getInclusionNames = (filter) => {
  const primaryInclusions = filter.include
    ? filter.include
      .filter(
        (primary) =>
          (primary.scope && primary.scope.where) ||
          (primary.scope && primary.scope.include),
      )
      .map(({ relation }) => relation)
    : [];

  return primaryInclusions.length > 0 &&
    filter.include.filter(
      (inclusion) => inclusion.scope && inclusion.scope.include,
    ).length > 0
    ? Object.assign(
      ...primaryInclusions.map((primary) => ({
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
                .map(({ relation }) => relation)
              : [],
          ),
        ),
      })),
    )
    : {};
};

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
  const convertedValue = quantity.substring(0, quantity.indexOf(" "));
  const convertedUnit = quantity.substring(quantity.indexOf(" ") + 1);
  return { valueSI: Number(convertedValue), unitSI: convertedUnit };
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
  const formatted = math.format(converted, { precision: 3 }).toString();
  const formattedValue = formatted.substring(0, formatted.indexOf(" "));
  const formattedUnit = formatted.substring(formatted.indexOf(" ") + 1);
  return { value: Number(formattedValue), unit: formattedUnit };
};

/**
 * Extracts the name, value and unit from parameter where filter
 * @param {object} where PaNOSC parameter where filter object
 * @returns {object} Object with the extracted name, value and unit
 */

exports.extractParamaterFilter = (where) => {
  if (where && where.and) {
    const name = where.and.find((condition) =>
      Object.keys(condition).includes("name"),
    )
      ? where.and.find((condition) => Object.keys(condition).includes("name"))[
      "name"
      ]
      : null;
    const value = where.and.find((condition) =>
      Object.keys(condition).includes("value"),
    )
      ? where.and.find((condition) => Object.keys(condition).includes("value"))[
      "value"
      ]
      : null;
    const unit = where.and.find((condition) =>
      Object.keys(condition).includes("unit"),
    )
      ? where.and.find((condition) => Object.keys(condition).includes("unit"))[
      "unit"
      ]
      : null;
    return { name, value, unit };
  } else {
    return { name: null, value: null, unit: null };
  }
};

exports.filterEmpty = (inclusions, returnObject, entity) => {
  if (inclusions[entity].where && Object.keys(returnObject[entity]).length == 0) {
    throw new errors.EmptyFilteredError(entity)
  }
};

exports.applyInclusions = (ScicatObject, panoscObject, inclusions, functionMapper) => {
  return Object.keys(functionMapper).reduce(
    (accumulator, currentValue) => {
      if (Object.keys(inclusions).includes(currentValue)) {
        const ds = { ...accumulator };
        ds[currentValue] = functionMapper[currentValue](ScicatObject, inclusions);
        try {
          this.filterEmpty(inclusions, ds, currentValue);
        }
        catch (e) {
          if (!(Object.values(errors).some(err => e instanceof err))) { throw e }
          return undefined
        }
        return ds;
      }
      return accumulator;
    }, panoscObject
  );
};

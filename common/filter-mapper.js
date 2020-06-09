'use strict';

module.exports = class FilterMapper {
  constructor() {}

  dataset(filter) {
    if (!filter) {
      return null;
    } else {
      let scicatFilter = {};
      if (filter.where) {
        scicatFilter.where = {};
        if (filter.where.and) {
          scicatFilter.where.and = filter.where.and.map((item) =>
            Object.assign(
              ...Object.keys(item).map((key) => ({
                [panoscToScicatDataset[key]]: item[key],
              })),
            ),
          );
        } else if (filter.where.or) {
          scicatFilter.where.or = filter.where.or.map((item) =>
            Object.assign(
              ...Object.keys(item).map((key) => ({
                [panoscToScicatDataset[key]]: item[key],
              })),
            ),
          );
        } else {
          scicatFilter.where = Object.assign(
            ...Object.keys(filter.where).map((key) => ({
              [panoscToScicatDataset[key]]: filter.where[key],
            })),
          );
        }
      }
      if (filter.include) {
        // DO SOMETHING
      }
      if (filter.skip) {
        scicatFilter.skip = filter.skip;
      }
      if (filter.limit) {
        scicatFilter.limit = filter.limit;
      }
      return scicatFilter;
    }
  }

  document(filter) {
    if (!filter) {
      return null;
    } else {
      return filter;
    }
  }

  files(filter) {
    if (!filter) {
      return null;
    } else {
      return filter;
    }
  }

  instrument(filter) {
    if (!filter) {
      return null;
    } else {
      return filter;
    }
  }
};

const panoscToScicatDataset = {
  pid: 'pid',
  title: 'datasetName',
  isPublic: 'isPublished',
  size: 'size',
  creationTime: 'creationDate',
};

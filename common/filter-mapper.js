'use strict';

module.exports = class FilterMapper {
  constructor() {}

  dataset(filter) {
    if (!filter) {
      return null;
    } else {
      let scicatFilter = {};
      if (filter.where) {
        scicatFilter.where = mapWhereFilter(filter.where, 'dataset');
      }
      if (filter.include) {
        const parameters = filter.include.find(
          (inclusion) => inclusion.relation === 'parameters',
        );
        if (parameters && parameters.scope && parameters.scope.where) {
          scicatFilter = mapParameters(parameters, scicatFilter);
        }
        const include = filter.include.filter(
          (inclusion) => inclusion.relation !== 'parameters',
        );
        scicatFilter.include = mapIncludeFilter(include);
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

const panoscToScicatFile = {
  id: 'id',
  name: 'dataFileList.path',
  path: 'dataFileList.path',
  size: 'dataFileList.size',
};

const mapWhereFilter = (where, model) => {
  console.log('>>> where', where);
  console.log('>>> model', model);
  let scicatWhere = {};
  if (where.and) {
    switch (model) {
      case 'dataset': {
        scicatWhere.and = where.and.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [panoscToScicatDataset[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'files': {
        scicatWhere.and = where.and.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [panoscToScicatFile[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'parameters': {
        scicatWhere.and = [];
        const name = where.and.find((condition) =>
          Object.keys(condition).includes('name'),
        )['name'];
        const value = where.and.find((condition) =>
          Object.keys(condition).includes('value'),
        )['value'];
        const unit = where.and.find((condition) =>
          Object.keys(condition).includes('unit'),
        )['unit'];
        scicatWhere.and.push({[`scientificMetadata.${name}.value`]: value});
        scicatWhere.and.push({[`scientificMetadata.${name}.unit`]: unit});
        break;
      }
    }
  } else if (where.or) {
    switch (model) {
      case 'dataset': {
        scicatWhere.or = where.or.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [panoscToScicatDataset[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'files': {
        scicatWhere.or = where.or.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [panoscToScicatFile[key]]: item[key],
            })),
          ),
        );
        break;
      }
    }
  } else {
    switch (model) {
      case 'dataset': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => ({
            [panoscToScicatDataset[key]]: where[key],
          })),
        );
        break;
      }
      case 'files': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => {
            return {[panoscToScicatFile[key]]: where[key]};
          }),
        );
        break;
      }
    }
  }
  console.log('>>>> scicatWhere', scicatWhere);
  return scicatWhere;
};

const mapIncludeFilter = (include) =>
  include.map((item) => {
    let inclusion = {};
    switch (item.relation) {
      case 'files': {
        inclusion.relation = 'origdatablocks';
        if (item.scope) {
          inclusion.scope = {};
          if (item.scope.where) {
            inclusion.scope.where = mapWhereFilter(
              item.scope.where,
              item.relation,
            );
          }
        }
        break;
      }
      case 'instrument': {
        inclusion.relation = 'instrument';
        break;
      }
      case 'samples': {
        break;
      }
      case 'techniques': {
        break;
      }
      default: {
        break;
      }
    }

    console.log('>>> inclusion', JSON.stringify(inclusion));
    return inclusion;
  });

const mapParameters = (parameters, filter) => {
  if (filter.where) {
    const scicatParameters = mapWhereFilter(
      parameters.scope.where,
      parameters.relation,
    )['and'];
    if (filter.where.and) {
      filter.where.and = filter.where.and.concat(scicatParameters);
    } else if (filter.where.or) {
      filter.where.and = scicatParameters.concat({
        or: filter.where.or,
      });
      delete filter.where.or;
    } else {
      filter.where = {
        and: scicatParameters.concat(filter.where),
      };
    }
  } else {
    filter.where = mapWhereFilter(parameters.scope.where, parameters.relation);
  }
  return filter;
};

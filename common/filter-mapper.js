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
        const include = filter.include
          .filter((inclusion) => inclusion.relation !== 'parameters')
          .filter((inclusion) => inclusion.relation !== 'samples')
          .filter((inclusion) => inclusion.relation !== 'techniques');
        if (include.length > 0) {
          scicatFilter.include = mapIncludeFilter(include);
        }
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
      let scicatFilter = {};
      if (filter.where) {
        if (filter.where.and) {
          filter.where.and = filter.where.and
            .filter((where) => !Object.keys(where).includes('isPublic'))
            .filter((where) => !Object.keys(where).includes('type'));
          if (filter.where.and.length > 0) {
            scicatFilter.where = mapWhereFilter(filter.where, 'document');
          }
        } else if (filter.where.or) {
          filter.where.or = filter.where.or
            .filter((where) => !Object.keys(where).includes('isPublic'))
            .filter((where) => !Object.keys(where).includes('type'));
          if (filter.where.or.length > 0) {
            scicatFilter.where = mapWhereFilter(filter.where, 'document');
          }
        } else {
          delete filter.where.isPublic;
          delete filter.where.type;
          if (Object.keys(filter.where).length > 0) {
            scicatFilter.where = mapWhereFilter(filter.where, 'document');
          }
        }
      }
      if (filter.include) {
        const members = filter.include.find(
          (inclusion) => inclusion.relation === 'members',
        );
        console.log('>>> document filter.include members', members);

        if (members) {
          scicatFilter = mapMembers(members, scicatFilter);
        }

        const include = filter.include
          .filter((inclusion) => inclusion.relation !== 'datasets')
          .filter((inclusion) => inclusion.relation !== 'members');
        if (include.length > 0) {
          scicatFilter.include = mapIncludeFilter(include);
        }
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

const panoscToScicatDocument = {
  pid: 'pid',
  title: 'title',
  summary: 'abstract',
  doi: 'doi',
};

const panoscToScicatFile = {
  id: 'id',
  name: 'dataFileList.path',
  path: 'dataFileList.path',
  size: 'dataFileList.size',
};

const mapWhereFilter = (where, model) => {
  console.log('>>> mapWhereFilter where', where);
  console.log('>>> mapWhereFilter model', model);
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
      case 'document': {
        scicatWhere.and = where.and.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [panoscToScicatDocument[key]]: item[key],
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
      case 'document': {
        scicatWhere.or = where.or.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [panoscToScicatDocument[key]]: item[key],
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
      case 'document': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => ({
            [panoscToScicatDocument[key]]: where[key],
          })),
        );
        break;
      }
      case 'files': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => ({
            [panoscToScicatFile[key]]: where[key],
          })),
        );
        break;
      }
      case 'members': {
        console.log('>>> members where', where);
        scicatWhere.or = [
          Object.assign(
            ...Object.keys(where).map((key) => ({
              creator: where[key],
              authors: where[key],
            })),
          ),
        ];
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
        if (item.scope) {
          if (item.scope.where && item.scope.where.facility) {
            delete item.scope.where.facility;
          }
          inclusion.scope = item.scope;
        }
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

function mapMembers(members, filter) {
  console.log('>>> mapMembers members', members);
  console.log('>>> mapMembers filter', filter);
  const person = members.scope.include.find(
    (inclusion) => inclusion.relation === 'person',
  );
  console.log('>>> mapMembers person', person);
  if (filter.where) {
    const scicatMembers = mapWhereFilter(members.scope.where, members.relation);
    if (filter.where.and) {
      filter.where.and = filter.where.and.concat(scicatMembers);
    } else if (filter.where.or) {
      filter.where.and = scicatMembers.concat({
        or: filter.where.or,
      });
      delete filter.where.or;
    } else {
      filter.where = {and: scicatMembers.concat(filter.where)};
    }
  } else {
    filter.where = mapWhereFilter(person.scope.where, members.relation);
  }
  return filter;
}

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

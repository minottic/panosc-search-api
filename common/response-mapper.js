'use strict';

const filterMapper = require('./filter-mapper');
const ScicatService = require('./scicat-service');
const {extractParamater, convertToUnit} = require('./utils');
const scicatDatasetService = new ScicatService.Dataset();
const scicatPublishedDataService = new ScicatService.PublishedData();
const scicatSampleService = new ScicatService.Sample();

exports.dataset = async (scicatDataset, filter) => {
  const dataset = {
    pid: scicatDataset.pid,
    title: scicatDataset.datasetName,
    isPublic: scicatDataset.isPublished,
    size: scicatDataset.size,
    creationDate: scicatDataset.creationTime,
  };

  console.log('>>> ResponseMapper.dataset default dataset', dataset);

  const inclusions = getInclusions(filter);
  console.log('>>> ResponseMapper.dataset inclusions', inclusions);

  try {
    if (Object.keys(inclusions).includes('document')) {
      const publishedDataFilter = {where: {pidArray: scicatDataset.pid}};
      const scicatPublishedData = await scicatPublishedDataService.find(
        publishedDataFilter,
      );
      dataset.document =
        scicatPublishedData.length > 0
          ? this.document(scicatPublishedData[0], inclusions.document)
          : {};
    }
    if (Object.keys(inclusions).includes('files')) {
      dataset.files = scicatDataset.origdatablocks
        ? this.files(scicatDataset.origdatablocks)
        : [];
    }
    if (Object.keys(inclusions).includes('instrument')) {
      dataset.instrument = scicatDataset.instrument
        ? this.instrument(scicatDataset.instrument)
        : {};
    }
    if (Object.keys(inclusions).includes('parameters')) {
      dataset.parameters = scicatDataset.scientificMetadata
        ? this.parameters(
            scicatDataset.scientificMetadata,
            inclusions.parameters,
          )
        : [];
    }
    if (Object.keys(inclusions).includes('samples')) {
      const sampleId = scicatDataset.sampleId;
      if (sampleId) {
        console.log('>>> ResponseMapper.dataset sampleId', sampleId);
        const scicatFilter = filterMapper.sample(inclusions.samples);
        console.log(
          '>>> ResponseMapper.dataset sample filter',
          JSON.stringify(scicatFilter),
        );
        let filter = {};
        if (scicatFilter.where) {
          filter = {where: {}};
          if (scicatFilter.where.and) {
            filter.where.and = [];
            filter.where.and.push({sampleId});
            filter.where.and = filter.where.and.concat(scicatFilter.where.and);
          } else if (scicatFilter.where.or) {
            filter.where.and = [];
            filter.where.and.push({sampleId});
            filter.where.and.push({or: scicatFilter.where.or});
          } else {
            filter.where = {and: [{sampleId}].concat(scicatFilter.where)};
          }
        } else {
          filter.where = {sampleId};
        }
        const scicatSamples = await scicatSampleService.find(filter);
        dataset.samples =
          scicatSamples.length > 0
            ? scicatSamples.map((sample) => this.sample(sample))
            : [];
      } else {
        dataset.samples = [];
      }
    }
    if (Object.keys(inclusions).includes('techniques')) {
      dataset.techniques = scicatDataset.techniques
        ? scicatDataset.techniques
        : [];
    }
  } catch (err) {
    throw err;
  }

  console.log('>>> dataset', dataset);
  return dataset;
};

exports.parameters = (scientificMetadata, filter) => {
  const parameter = extractParamater(filter.where);
  return Object.keys(scientificMetadata).map((key) => {
    if (key === parameter.name) {
      const {value, unit} = convertToUnit(
        scientificMetadata[key].value,
        scientificMetadata[key].unit,
        parameter.unit,
      );
      return {
        name: key,
        value,
        unit,
      };
    } else {
      return {
        name: key,
        value: scientificMetadata[key].value,
        unit: scientificMetadata[key].unit,
      };
    }
  });
};

exports.publishedData = async (scicatPublishedData, filter) => {
  const document = {
    pid: scicatPublishedData.doi,
    isPublic: true,
    type: 'publication',
    title: scicatPublishedData.title,
    summary: scicatPublishedData.abstract,
    doi: scicatPublishedData.doi,
  };

  const inclusions = getInclusions(filter);

  console.log('>>> pubData inclusions', inclusions);

  try {
    if (Object.keys(inclusions).includes('datasets')) {
      const scicatFilter = filterMapper.dataset(inclusions.datasets);
      console.log(
        '>>> ResponseMapper dataset scicatFilter',
        JSON.stringify(scicatFilter),
      );
      const datasets = await Promise.all(
        scicatPublishedData.pidArray
          .map((pid) =>
            pid.split('/')[0] === pid.split('/')[1]
              ? pid.split('/').slice(1).join('/')
              : pid,
          )
          .map(async (pid) => {
            if (scicatFilter.where) {
              if (scicatFilter.where.and) {
                scicatFilter.where.and.push({pid});
              } else if (scicatFilter.where.or) {
                scicatFilter.where.and = [];
                scicatFilter.where.and.push({pid});
                scicatFilter.where.and.push({or: scicatFilter.where.or});
                delete scicatFilter.where.or;
              } else {
                scicatFilter.where = {and: [{pid}].concat(scicatFilter.where)};
              }
            } else {
              scicatFilter.where = {pid};
            }
            const datasets = await scicatDatasetService.find(scicatFilter);
            return datasets.length > 0
              ? datasets.find((dataset) => dataset.pid === pid)
              : {};
          }),
      );
      console.log('>>> ResponseMapper.document datasets', datasets);
      document.datasets = await Promise.all(
        datasets.map(
          async (dataset) => await this.dataset(dataset, inclusions.datasets),
        ),
      );
    }
    if (Object.keys(inclusions).includes('members')) {
      document.members = this.members(scicatPublishedData, inclusions.members);
    }
  } catch (err) {
    throw err;
  }
  console.log('>>> document', document);
  return document;
};

exports.files = (scicatOrigDatablocks) => {
  return [].concat.apply(
    [],
    scicatOrigDatablocks.map((datablock) =>
      datablock.dataFileList.map((file) => {
        const splitPath = file.path.split('/');
        const name = splitPath.pop();
        const path = splitPath.join('/');
        return {
          id: datablock.id,
          name,
          path,
          size: file.size,
        };
      }),
    ),
  );
};

exports.instrument = (scicatInstrument) => {
  return scicatInstrument.pid && scicatInstrument.name
    ? {
        pid: scicatInstrument.pid,
        name: scicatInstrument.name,
        facility: 'ESS',
      }
    : {};
};

exports.members = (scicatPublishedData, filter) => {
  const inclusions = filter.include
    ? Object.assign(
        ...filter.include.map((inclusion) =>
          inclusion.scope
            ? {[inclusion.relation]: inclusion.scope}
            : {[inclusion.relation]: {}},
        ),
      )
    : {};
  const creators =
    inclusions.person && scicatPublishedData.creator
      ? scicatPublishedData.creator.map((creator) => ({
          person: {fullName: creator},
        }))
      : [];
  const authors =
    inclusions.person && scicatPublishedData.authors
      ? scicatPublishedData.authors.map((author) => ({
          person: {fullName: author},
        }))
      : [];
  return creators.concat(authors);
};

exports.sample = (scicatSample) => {
  return {
    name: scicatSample.description,
  };
};

const getInclusions = (filter) =>
  filter && filter.include
    ? Object.assign(
        ...filter.include.map((inclusion) =>
          inclusion.scope
            ? {[inclusion.relation]: inclusion.scope}
            : {[inclusion.relation]: {}},
        ),
      )
    : {};

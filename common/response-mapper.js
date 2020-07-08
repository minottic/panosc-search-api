'use strict';

const filterMapper = require('./filter-mapper');
const ScicatService = require('./scicat.service');
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
    score: 0,
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
        ? this.parameters(scicatDataset.scientificMetadata)
        : [];
    }
    if (Object.keys(inclusions).includes('samples')) {
      const sampleId = scicatDataset.sampleId;
      if (sampleId) {
        const scicatSample = await scicatSampleService.findById(sampleId);
        if (inclusions.samples.where) {
          const {where} = inclusions.samples;
          if (where.and) {
            // DO SOMETHING
            dataset.samples = [];
          } else if (where.or) {
            // DO SOMETHING
            dataset.samples = [];
          } else {
            dataset.samples =
              where.name && where.name === scicatSample.description
                ? [this.sample(scicatSample)]
                : [];
          }
        } else {
          dataset.samples = [this.sample(scicatSample)];
        }
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

exports.parameters = (scientificMetadata) => {
  return Object.keys(scientificMetadata).map((key) => ({
    name: key,
    value: scientificMetadata[key].value,
    unit: scientificMetadata[key].unit,
  }));
};

exports.publishedData = async (scicatPublishedData, filter) => {
  const document = {
    pid: scicatPublishedData.doi,
    isPublic: true,
    type: 'publication',
    title: scicatPublishedData.title,
    summary: scicatPublishedData.abstract,
    doi: scicatPublishedData.doi,
    score: 0,
  };

  const inclusions = getInclusions(filter);

  console.log('>>> pubData inclusions', inclusions);

  try {
    if (Object.keys(inclusions).includes('datasets')) {
      const scicatFilter = filterMapper.dataset(inclusions.datasets);
      console.log('>>> ResponseMapper dataset scicatFilter', scicatFilter);
      const datasets = await Promise.all(
        scicatPublishedData.pidArray
          .map((pid) =>
            pid.split('/')[0] === pid.split('/')[1]
              ? pid.split('/').slice(1).join('/')
              : pid,
          )
          .map(
            async (pid) =>
              await scicatDatasetService.findById(pid, scicatFilter),
          ),
      );
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
        score: 0,
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
  const creators = inclusions.person
    ? scicatPublishedData.creator.map((creator) => ({
        person: {fullName: creator},
      }))
    : [];
  const authors = inclusions.person
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

'use strict';

const ScicatService = require('./scicat.service');
const scicatDatasetService = new ScicatService.Dataset();

module.exports = class ResponseMapper {
  constructor() {}

  dataset(scicatDataset, filter) {
    const dataset = {
      pid: scicatDataset.pid,
      title: scicatDataset.datasetName,
      isPublic: scicatDataset.isPublished,
      size: scicatDataset.size,
      creationDate: scicatDataset.creationTime,
      score: 0,
    };

    console.log('>>> ResponseMapper.dataset default dataset', dataset);

    const inclusions =
      filter && filter.include
        ? Object.assign(
            ...filter.include.map((inclusion) =>
              inclusion.scope
                ? {[inclusion.relation]: inclusion.scope}
                : {[inclusion.relation]: {}},
            ),
          )
        : {};
    console.log('>>> ResponseMapper.dataset inclusions', inclusions);

    Object.keys(inclusions).forEach((primary) => {
      switch (primary) {
        case 'document': {
          break;
        }
        case 'files': {
          dataset.files = this.files(scicatDataset.origdatablocks);
          break;
        }
        case 'instrument': {
          if (scicatDataset.instrument) {
            dataset.instrument = this.instrument(scicatDataset.instrument);
          }
          break;
        }
        case 'parameters': {
          dataset.parameters = this.parameters(
            scicatDataset.scientificMetadata,
          );
          break;
        }
        case 'samples': {
          dataset.samples = [{name: 'Sample sample'}];
          break;
        }
        case 'techniques': {
          if (scicatDataset.techniquesList) {
            dataset.techniques = scicatDataset.techniquesList;
          }
          break;
        }
      }
    });

    console.log('>>> dataset', dataset);
    return dataset;
  }

  parameters(scientificMetadata) {
    return Object.keys(scientificMetadata).map((key) => ({
      name: key,
      value: scientificMetadata[key].value,
      unit: scientificMetadata[key].unit,
    }));
  }

  async publishedData(scicatPublishedData, filter) {
    const document = {
      pid: scicatPublishedData.doi,
      isPublic: true,
      type: 'publication',
      title: scicatPublishedData.title,
      summary: scicatPublishedData.abstract,
      doi: scicatPublishedData.doi,
      score: 0,
    };

    const inclusions =
      filter && filter.include
        ? Object.assign(
            ...filter.include.map((inclusion) =>
              inclusion.scope
                ? {[inclusion.relation]: inclusion.scope}
                : {[inclusion.relation]: {}},
            ),
          )
        : {};

    console.log('>>> pubData inclusions', inclusions);

    try {
      if (Object.keys(inclusions).includes('datasets')) {
        const datasets = await Promise.all(
          scicatPublishedData.pidArray
            .map((pid) =>
              pid.split('/')[0] === pid.split('/')[1]
                ? pid.split('/').slice(1).join('/')
                : pid,
            )
            .map(async (pid) => await scicatDatasetService.findById(pid)),
        );
        document.datasets = datasets.map((dataset) =>
          this.dataset(dataset, inclusions.datasets),
        );
      }
      if (Object.keys(inclusions).includes('members')) {
        document.members = this.members(
          scicatPublishedData,
          inclusions.members,
        );
      }
    } catch (err) {
      return err;
    }
    console.log('>>> document', document);
    return document;
  }

  files(scicatOrigDatablocks) {
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
  }

  instrument(scicatInstrument) {
    return {
      pid: scicatInstrument.pid,
      name: scicatInstrument.name,
      facility: 'ESS',
    };
  }

  members(scicatPublishedData, filter) {
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
  }

  person(scicatPublishedData, filter) {
    return {
      fullName: 'Sample FullName',
    };
  }

  sample(scicatSample) {
    return {
      name: scicatSample.description,
    };
  }
};

'use strict';

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

    const primaryRelations = filter.include
      ? filter.include.map((primary) => primary.relation)
      : [];

    primaryRelations.forEach((primary) => {
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
          dataset.samples = scicatDataset.sampleId;
          break;
        }
        case 'techniques': {
          dataset.techniques = scicatDataset.technique;
          break;
        }
      }
    });

    return dataset;
  }

  parameters(scientificMetadata) {
    return Object.keys(scientificMetadata).map((key) => ({
      name: key,
      value: scientificMetadata[key].value,
      unit: scientificMetadata[key].unit,
    }));
  }

  publishedData(scicatPublishedData) {
    return {
      pid: scicatPublishedData.doi,
      isPublic: true,
      type: 'publication',
      title: scicatPublishedData.title,
      summary: scicatPublishedData.abstract,
      doi: scicatPublishedData.doi,
      score: 0,
    };
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
};

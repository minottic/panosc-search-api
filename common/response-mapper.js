'use strict';

module.exports = class ResponseMapper {
  constructor() {}

  dataset(scicatDataset) {
    return {
      pid: scicatDataset.pid,
      title: scicatDataset.datasetName,
      isPublic: scicatDataset.isPublished,
      size: scicatDataset.size,
      creationDate: scicatDataset.creationTime,
      score: 0,
    };
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

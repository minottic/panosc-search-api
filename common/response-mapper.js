"use strict";

const filterMapper = require("./filter-mapper");
const utils = require("./utils");
const ScicatService = require("./scicat-service");
const scicatDatasetService = new ScicatService.Dataset();
const scicatPublishedDataService = new ScicatService.PublishedData();
const scicatSampleService = new ScicatService.Sample();

/**
 * Map a SciCat dataset to a PaNOSC dataset
 * @param {object} scicatDataset Scicat dataset object
 * @param {object} filter PaNOSC loopback filter object
 * @returns {object} PaNOSC dataset object
 */

exports.dataset = async (scicatDataset, filter) => {
  const dataset = {
    pid: scicatDataset.pid,
    title: scicatDataset.datasetName,
    isPublic: scicatDataset.isPublished,
    size: scicatDataset.size,
    creationDate: scicatDataset.creationTime,
  };

  const inclusions = utils.getInclusions(filter);

  const functionMapper = {
    document: this.documentToDataset,
    files: this.filesToDataset,
    instrument: this.instrumentToDataset,
    parameters: this.parametersToDataset,
    samples: this.samplesToDataset,
    techniques: this.techniquesToDataset,
  };

  return utils.applyInclusions(scicatDataset, dataset, inclusions, functionMapper);
};

exports.documentToDataset = async (scicatDataset, inclusions) => {
  const publishedDataFilter = { where: { pidArray: scicatDataset.pid } };
  const scicatPublishedData = await scicatPublishedDataService.find(
    publishedDataFilter
  );
  return scicatPublishedData.length > 0
    ? await this.document(scicatPublishedData[0], inclusions.document)
    : {};
};

exports.filesToDataset = (scicatDataset) => {
  return scicatDataset.origdatablocks
    ? this.files(scicatDataset.origdatablocks)
    : [];
};

exports.instrumentToDataset = (scicatDataset) => {
  return scicatDataset.instrument
    ? this.instrument(scicatDataset.instrument)
    : {};
};

exports.parametersToDataset = (scicatDataset, inclusions) => {
  return scicatDataset.scientificMetadata
    ? this.parameters(scicatDataset.scientificMetadata, inclusions.parameters)
    : [];
};

exports.samplesToDataset = async (scicatDataset, inclusions) => {
  const sampleId = scicatDataset.sampleId;
  if (sampleId) {
    const scicatFilter = filterMapper.sample(inclusions.samples);
    let filter = {};
    if (scicatFilter.where) {
      filter.where = {};
      if (scicatFilter.where.and) {
        filter.where.and = [];
        filter.where.and.push({ sampleId });
        filter.where.and = filter.where.and.concat(scicatFilter.where.and);
      } else if (scicatFilter.where.or) {
        filter.where.and = [];
        filter.where.and.push({ sampleId });
        filter.where.and.push({ or: scicatFilter.where.or });
      } else {
        filter.where = { and: [{ sampleId }].concat(scicatFilter.where) };
      }
    } else {
      filter.where = { sampleId };
    }
    const scicatSamples = await scicatSampleService.find(filter);
    return scicatSamples.length > 0
      ? scicatSamples.map((sample) => this.sample(sample))
      : [];
  } else {
    return [];
  }
};

exports.techniquesToDataset = (scicatDataset) => {
  return scicatDataset.techniques
    ? scicatDataset.techniques
    : [];
};

/**
 * Map a SciCat publication to a PaNOSC document
 * @param {object} scicatPublishedData SciCat publishedData object
 * @param {object} filter PaNOSC loopback filter object
 * @returns {object} PaNOSC document object
 */

exports.document = async (scicatPublishedData, filter) => {
  const document = {
    pid: scicatPublishedData.doi,
    isPublic: true,
    type: "publication",
    title: scicatPublishedData.title,
    summary: scicatPublishedData.abstract,
    doi: scicatPublishedData.doi,
  };

  const inclusions = utils.getInclusions(filter);

  const functionMapper = {
    dataset: this.datasetToDocument,
    members: this.membersToDocument,
    parameters: this.paramatersToDocument,
  };

  return utils.applyInclusions(scicatPublishedData, document, inclusions, functionMapper);
};

exports.datasetToDocument = async (scicatPublishedData, inclusions) => {
  const scicatFilter = filterMapper.dataset(inclusions.datasets);
  const pidArray = scicatPublishedData.pidArray.map((pid) =>
    pid.split("/")[0] === pid.split("/")[1]
      ? pid.split("/").slice(1).join("/")
      : pid
  );
  const datasets = await Promise.all(
    pidArray.map(async (pid) => {
      let filter = {};
      if (scicatFilter.where) {
        filter.where = {};
        if (scicatFilter.where.and) {
          filter.where.and = [];
          filter.where.and.push({ pid });
          filter.where.and = filter.where.and.concat(scicatFilter.where.and);
        } else if (scicatFilter.where.or) {
          filter.where.and = [];
          filter.where.and.push({ pid });
          filter.where.and.push({ or: scicatFilter.where.or });
        } else {
          filter.where = { and: [{ pid }].concat(scicatFilter.where) };
        }
      } else {
        filter.where = { pid };
      }
      if (scicatFilter.include) {
        filter.include = scicatFilter.include;
      }
      const datasets = await scicatDatasetService.find(filter);
      return datasets.length > 0 ? datasets[0] : {};
    })
  );
  return await Promise.all(
    datasets.map(
      async (dataset) => await this.dataset(dataset, inclusions.datasets)
    )
  );
};

exports.membersToDocument = (scicatPublishedData, inclusions) => {
  return this.members(scicatPublishedData, inclusions.members);
};

exports.paramatersToDocument = () => {
  return [];
}

/**
 * Map an array of SciCat origDatablocks to an array of PaNOSC files
 * @param {object[]} scicatOrigDatablocks Array of SciCat origDatablock objects
 * @returns {object[]} Array of PaNOSC file objects
 */

exports.files = (scicatOrigDatablocks) => {
  return [].concat.apply(
    [],
    scicatOrigDatablocks.map((datablock) =>
      datablock.dataFileList.map((file) => {
        const splitPath = file.path.split("/");
        const name = splitPath.pop();
        const path = splitPath.join("/");
        return {
          id: datablock.id,
          name,
          path,
          size: file.size,
        };
      })
    )
  );
};

/**
 * Map a SciCat instrument to a PaNOSC instrument
 * @param {object} scicatInstrument SciCat instrument object
 * @returns {object} PaNOSC instrument object
 */

exports.instrument = (scicatInstrument) => {
  return scicatInstrument.pid && scicatInstrument.name
    ? {
      pid: scicatInstrument.pid,
      name: scicatInstrument.name,
      facility: process.env.FACILITY || "ESS",
    }
    : {};
};

/**
 * Map SciCat publication members to PaNOSC members
 * @param {object} scicatPublishedData SciCat publishedData object
 * @param {object} filter PaNOSC loopback filter object
 * @returns {object[]} Array of PaNOSC members
 */

exports.members = (scicatPublishedData, filter) => {
  const inclusions = filter.include
    ? Object.assign(
      ...filter.include.map((inclusion) =>
        inclusion.scope
          ? { [inclusion.relation]: inclusion.scope }
          : { [inclusion.relation]: {} }
      )
    )
    : {};
  const creators =
    inclusions.person && scicatPublishedData.creator
      ? scicatPublishedData.creator.map((creator) => ({
        person: { fullName: creator },
      }))
      : [];
  const authors =
    inclusions.person && scicatPublishedData.authors
      ? scicatPublishedData.authors.map((author) => ({
        person: { fullName: author },
      }))
      : [];
  return creators.concat(authors);
};

/**
 * Map SciCat scientificMetadata to PaNOSC parameters
 * @param {object} scientificMetadata SciCat scientificMetadata object
 * @param {object} filter PaNOSC loopback filter object
 * @returns {object[]} Array of PaNOSC parameter objects
 */

exports.parameters = (scientificMetadata, filter) => {
  const parameter = utils.extractParamaterFilter(filter.where);
  return Object.keys(scientificMetadata).map((key) => {
    if (key === parameter.name) {
      const { value, unit } = utils.convertToUnit(
        scientificMetadata[key].value,
        scientificMetadata[key].unit,
        parameter.unit
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

/**
 * Map SciCat sample to PaNOSC sample
 * @param {object} scicatSample SciCat sample object
 * @returns {object} PaNOSC sample object
 */

exports.sample = (scicatSample) => {
  return {
    name: scicatSample.description,
  };
};

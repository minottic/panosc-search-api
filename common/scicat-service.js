"use strict";

const superagent = require("superagent");

const baseUrl = process.env.BASE_URL || "http://localhost:3030/api/v3";

exports.Dataset = class {
  /**
   * Query SciCat datasets matching filter
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat dataset objects
   */

  async find(filter) {
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> Dataset.find filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Datasets?filter=" + jsonFilter
      : baseUrl + "/Datasets";
    const res = await superagent.get(url);
    console.log(url)
    return JSON.parse(res.text);
  }

  /**
   * Find a SciCat dataset by id
   * @param {string} id SciCat dataset pid
   * @param {object} filter SciCat loopback filter object
   * @returns {object} SciCat dataset object
   */

  async findById(id, filter) {
    const encodedId = encodeURIComponent(id);
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> Dataset.findById pid", encodedId);
    console.log(">>> Dataset.findById filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Datasets/" + encodedId + "?filter=" + jsonFilter
      : baseUrl + "/Datasets/" + encodedId;
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Get count of SciCat datasets matching filter
   * @param {object} filter SciCat loopback filter object
   * @returns {object} Object with key `count` and number of matching SciCat datasets as value
   */

  async count(filter) {
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> Dataset.count filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Datasets?filter=" + jsonFilter
      : baseUrl + "/Datasets";
    const res = await superagent.get(url);
    const datasets = JSON.parse(res.text);
    return { count: datasets.length };
  }

  /**
   * Get origDatablocks for SciCat dataset
   * @param {string} id SciCat dataset pid
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat origDatablock objects
   */

  async findByIdFiles(id, filter) {
    const encodedId = encodeURIComponent(id);
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> Dataset.findByIdFiles pid", encodedId);
    console.log(">>> Dataset.findByIdFiles filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Datasets/" + encodedId + "?filter=" + jsonFilter
      : baseUrl + "/Datasets/" + encodedId;
    const res = await superagent.get(url);
    return JSON.parse(res.text)["origdatablocks"];
  }
};

exports.PublishedData = class {
  /**
   * Query SciCat publications matching filter
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat publishedData objects
   */

  async find(filter) {
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> PublishedData.find filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/PublishedData?filter=" + jsonFilter
      : baseUrl + "/PublishedData";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Find a SciCat publication by id
   * @param {string} id SciCat publishedData doi
   * @param {object} filter SciCat loopback filter object
   * @returns {object} SciCat publishedData object
   */

  async findById(id, filter) {
    const encodedId = encodeURIComponent(id);
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> PublishedData.findById pid", encodedId);
    console.log(">>> PublishedData.findById filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/PublishedData/" + encodedId + "?filter=" + jsonFilter
      : baseUrl + "/PublishedData/" + encodedId;
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Get count of SciCat publications mathing query
   * @param {object} where SciCat where filter object
   * @returns {object} Object with key `count` and number of matching SciCat publications as value
   */

  async count(where) {
    const jsonWhere = JSON.stringify(where);
    console.log(">>> PublishedData.count where", jsonWhere);
    const url = jsonWhere
      ? baseUrl + "/PublishedData/count?where=" + jsonWhere
      : baseUrl + "/PublishedData/count";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }
};

exports.Instrument = class {
  /**
   * Query SciCat instruments matching query
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat instrument objects
   */

  async find(filter) {
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> Instrument.find filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Instruments?filter=" + jsonFilter
      : baseUrl + "/Instruments";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Find a SciCat instrument by id
   * @param {string} id SciCat instrument id
   * @param {object} filter SciCat loopback filter object
   * @returns {object} SciCat instrument object
   */

  async findById(id, filter) {
    const encodedId = encodeURIComponent(id);
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> Instrument.findById id", encodedId);
    console.log(">>> Instrument.findById filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Instruments/" + encodedId + "?filter=" + jsonFilter
      : baseUrl + "/Instruments/" + encodedId;
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Get count of SciCat instruments matching query
   * @param {object} where SciCat where filter object
   * @returns {object} Object with key `count` and number of matching SciCat instruments as value
   */

  async count(where) {
    const jsonWhere = JSON.stringify(where);
    console.log(">>> Instrument.count where", jsonWhere);
    const url = jsonWhere
      ? baseUrl + "/Instruments/count?where=" + jsonWhere
      : baseUrl + "/Instruments/count";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }
};

exports.Sample = class {
  /**
   * Query SciCat samples matching query
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat sample objects
   */

  async find(filter) {
    const jsonFilter = JSON.stringify(filter);
    console.log(">>> Sample.find filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Samples?filter=" + jsonFilter
      : baseUrl + "/Samples";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }
};

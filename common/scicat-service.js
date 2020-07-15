'use strict';

const superagent = require('superagent');

const baseUrl = process.env.BASE_URL || 'http://localhost:3030/api/v3';

exports.Dataset = class {
  async find(filter) {
    try {
      const jsonFilter = JSON.stringify(filter);
      console.log('>>> Dataset.find filter', jsonFilter);
      const url = jsonFilter
        ? baseUrl + '/Datasets?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }

  async findById(id, filter) {
    try {
      const encodedId = encodeURIComponent(id);
      const jsonFilter = JSON.stringify(filter);
      console.log('>>> Dataset.findById pid', encodedId);
      console.log('>>> Dataset.findById filter', jsonFilter);
      const url = jsonFilter
        ? baseUrl + '/Datasets/' + encodedId + '?filter=' + jsonFilter
        : baseUrl + '/Datasets/' + encodedId;
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }

  async count(filter) {
    try {
      const jsonFilter = JSON.stringify(filter);
      console.log('>>> Dataset.count filter', jsonFilter);
      const url = jsonFilter
        ? baseUrl + '/Datasets?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      const datasets = JSON.parse(res.text);
      return {count: datasets.length};
    } catch (err) {
      throw err;
    }
  }

  async findByIdFiles(id, filter) {
    try {
      const encodedId = encodeURIComponent(id);
      const jsonFilter = JSON.stringify(filter);
      console.log('>>> Dataset.findByIdFiles pid', encodedId);
      console.log('>>> Dataset.findByIdFiles filter', jsonFilter);
      const url = jsonFilter
        ? baseUrl + '/Datasets/' + encodedId + '?filter=' + jsonFilter
        : baseUrl + '/Datasets/' + encodedId;
      const res = await superagent.get(url);
      return JSON.parse(res.text)['origdatablocks'];
    } catch (err) {
      throw err;
    }
  }
};

exports.PublishedData = class {
  async find(filter) {
    try {
      const jsonFilter = JSON.stringify(filter);
      console.log('>>> PublishedData.find filter', jsonFilter);
      const url = jsonFilter
        ? baseUrl + '/PublishedData?filter=' + jsonFilter
        : baseUrl + '/PublishedData';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }

  async findById(id, filter) {
    try {
      const encodedId = encodeURIComponent(id);
      const jsonFilter = JSON.stringify(filter);
      console.log('>>> PublishedData.findById pid', encodedId);
      console.log('>>> PublishedData.findById filter', jsonFilter);
      const url = jsonFilter
        ? baseUrl + '/PublishedData/' + encodedId + '?filter=' + jsonFilter
        : baseUrl + '/PublishedData/' + encodedId;
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }

  async count(where) {
    try {
      const jsonWhere = JSON.stringify(where);
      console.log('>>> PublishedData.count where', jsonWhere);
      const url = jsonWhere
        ? baseUrl + '/PublishedData/count?where=' + jsonWhere
        : baseUrl + '/PublishedData/count';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }
};

exports.Instrument = class {
  async find(filter) {
    try {
      const jsonFilter = JSON.stringify(filter);
      console.log('>>> Instrument.find filter', jsonFilter);
      const url = filter
        ? baseUrl + '/Instruments?filter=' + jsonFilter
        : baseUrl + '/Instruments';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }

  async findById(id, filter) {
    try {
      const encodedId = encodeURIComponent(id);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Instruments/' + encodedId + '?filter=' + jsonFilter
        : baseUrl + '/Instruments/' + encodedId;
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }

  async count(where) {
    try {
      const jsonWhere = JSON.stringify(where);
      const url = jsonWhere
        ? baseUrl + '/Instruments/count?where=' + jsonWhere
        : baseUrl + '/Instruments/count';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }
};

exports.Sample = class {
  async find(filter) {
    try {
      const jsonFilter = JSON.stringify(filter);
      console.log('>>> Sample.find filter', jsonFilter);
      const url = jsonFilter
        ? baseUrl + '/Samples?filter=' + jsonFilter
        : baseUrl + '/Samples';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }

  async findById(id) {
    try {
      const encodedId = encodeURIComponent(id);
      const url = baseUrl + '/Samples/' + encodedId;
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }
};

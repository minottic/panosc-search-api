'use strict';

const superagent = require('superagent');
const baseUrl = 'http://localhost:3030/api/v3';

exports.Dataset = class {
  async find(filter) {
    try {
      console.log('>>> Dataset.find filter', JSON.stringify(filter));
      const jsonFilter = JSON.stringify(filter);
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
      const url = filter
        ? baseUrl + '/Datasets/' + encodedId + '?filter=' + jsonFilter
        : baseUrl + '/Datasets/' + encodedId;
      console.log('>>> Dataset.findById url', url);
      const res = await superagent.get(url);
      console.log('>>> Dataset.findById res.text', res.text);
      return JSON.parse(res.text);
    } catch (err) {
      throw err;
    }
  }

  async count(where) {
    try {
      console.log('>>> COUNT FILTER', {where});
      const jsonFilter = JSON.stringify({where});
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
      if (!filter) {
        filter = {where: {pid: id}, include: [{relation: 'origdatablocks'}]};
      } else {
        if (!filter.where) {
          filter.where = {pid: id};
        } else {
          filter.where['pid'] = id;
        }
        if (!filter.include) {
          filter.include = [{relation: 'origdatablocks'}];
        } else {
          filter.include.push({relation: 'origdatablocks'});
        }
      }
      console.log('>>> FINDBYIDFILES FILTER', filter);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Datasets?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      return JSON.parse(res.text)[0]['origdatablocks'];
    } catch (err) {
      throw err;
    }
  }

  async countFiles(id, where) {
    try {
      const filter = {where};
      if (!filter) {
        filter = {where: {pid: id}};
      } else {
        if (!filter.where) {
          filter.where = {pid: id};
        } else {
          filter.where['pid'] = id;
        }
      }
      filter.include = [{relation: 'origdatablocks'}];
      console.log('>>> COUNTFILES FILTER', filter);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Datasets?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      const files = JSON.parse(res.text)[0]['origdatablocks'];
      return {count: files.length};
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

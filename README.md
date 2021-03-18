# Photon and Neutron Search Api

[![Build Status](https://travis-ci.org/SciCatProject/panosc-search-api.svg?branch=master)](https://travis-ci.org/SciCatProject/panosc-search-api)
[![Known Vulnerabilities](https://snyk.io/test/github/SciCatProject/panosc-search-api/master/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SciCatProject/panosc-search-api/master?targetFile=package.json)

## Prerequisites

- npm >= 6
- node >= 10

## Steps

1. `git clone https://github.com/SciCatProject/panosc-search-api.git`

2. `cd panosc-search-api`

3. `npm install`

4. Set the ENV variables
   ```bash
   export BASE_URL=<CATAMEL_API_BASE_URL> # e.g. https://scicat.ess.eu/api/v3
   export FACILITY=<YOUR_FACILITY> # e.g. ESS
   ```
5. `npm start`

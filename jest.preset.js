const nxPreset = require('@nrwl/jest/preset');
const mongoPreset = require('./tools/jest/jest-preset');

module.exports = {
  // ...mongoPreset,
  ...nxPreset
};

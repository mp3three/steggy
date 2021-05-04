const logger = require('pino')()
const cwd = process.cwd();
const path = require('path');
const fs = require('fs');
const globalConfigPath = path.join(cwd, 'globalConfig.json');

module.exports = async function () {
  logger.info('Teardown mongod');
  await global.__MONGOD__.stop();
  fs.unlinkSync(globalConfigPath);
};

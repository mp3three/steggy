const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const logger = require('pino')()

const cwd = process.cwd();

const globalConfigPath = path.join(cwd, 'globalConfig.json');

module.exports = class MongoEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    logger.info('Setup MongoDB Test Environment');

    const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));

    this.global.__MONGO_URI__ = globalConfig.mongoUri;
    this.global.__MONGO_DB_NAME__ = globalConfig.mongoDBName || uuid.v4();

    await super.setup();
  }

  async teardown() {
    logger.info('Teardown MongoDB Test Environment');

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
};

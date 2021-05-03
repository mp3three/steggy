const fs = require('fs');
const {resolve, join} = require('path');
const MongodbMemoryServer = require('mongodb-memory-server');
const cwd = process.cwd();
const logger = require('pino')()
const mongod = new MongodbMemoryServer.default(getMongodbMemoryOptions());

const globalConfigPath = join(cwd, 'globalConfig.json');

module.exports = async () => {
  if (!mongod.isRunning) {
    await mongod.start();
  }
  console.log('')

  const options = getMongodbMemoryOptions();

  const mongoConfig = {
    mongoUri: await mongod.getUri(),
    mongoDBName: options.instance.dbName
  };

  // Write global config to disk because all tests run in different contexts.
  fs.writeFileSync(globalConfigPath, JSON.stringify(mongoConfig));
  logger.info('Config is written');

  // Set reference to mongod in order to close the server during teardown.
  global.__MONGOD__ = mongod;
  process.env.MONGO_URL = mongoConfig.mongoUri;
};

function getMongodbMemoryOptions() {
  try {
    const {mongodbMemoryServerOptions} = require(resolve(cwd, 'jest-mongodb-config.js'));

    return mongodbMemoryServerOptions;
  } catch (e) {
    return {
      binary: {
        skipMD5: true
      },
      autoStart: false,
      instance: {}
    };
  }
}

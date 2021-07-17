// const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
//   const mongod = await MongoMemoryServer.create();
//   process.env.MONGO = mongod.getUri();
//   global.__MONGOD__ = mongod;
  process.env.MONGO = `mongodb://localhost:27017/jest`
};

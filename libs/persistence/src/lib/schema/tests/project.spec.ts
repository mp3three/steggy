// const { MongoClient } = require('mongodb');
import { Db, MongoClient } from 'mongodb';

describe('insert', () => {
  let connection: MongoClient;
  let database: Db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    database = await connection.db();
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should insert a doc into collection', async () => {
    expect.assertions(1);
    const users = database.collection('user');

    const mockUser = { _id: 'some-user-id', name: 'qe222' };
    await users.insertOne(mockUser);

    const insertedUser = await users.findOne({ _id: 'some-user-id' });
    expect(insertedUser).toStrictEqual(mockUser);
  });
});

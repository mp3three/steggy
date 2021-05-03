import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { ProjectSchema, SubmissionDocument } from '@automagical/persistence';
import { InjectMongo } from '@automagical/utilities';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Db, MongoClient } from 'mongodb';
import { Model } from 'mongoose';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

describe('insert', () => {
  let connection: MongoClient;
  let database: Db;
  let projectModel: Model<SubmissionDocument>;
  let logger: PinoLogger;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    database = await connection.db();

    const moduleReference = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URL, {
          connectionName: 'memory',
        }),
        MongooseModule.forFeature(
          [{ name: ProjectDTO.name, schema: ProjectSchema }],
          'memory',
        ),
      ],
      providers: [ConfigService],
    }).compile();
    projectModel = moduleReference.get(InjectMongo.token(ProjectDTO));
    logger = moduleReference.get(PinoLogger);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('bootstrap', () => {
    it('should create the model', async () => {
      expect.assertions(2);
      expect(projectModel).toBeDefined();
      logger.info({ keys: Object.keys(projectModel) }, 'model');
      expect(projectModel.baseModelName).toBe(ProjectDTO.name);
    });
  });
});

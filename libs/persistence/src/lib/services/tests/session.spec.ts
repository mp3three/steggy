import { ConfigModule } from '@automagical/config';
import { SessionDTO } from '@automagical/contracts/formio-sdk';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';
import { SessionService } from '..';

describe('session', () => {
  let sessionService: SessionService;
  const logger = pino();
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    const moduleReference = await Test.createTestingModule({
      imports: [
        ConfigModule.register('jest-test'),
        PersistenceModule.registerMongoose(),
        LoggerModule.forRoot(),
        PersistenceModule.mongooseRoot(await mongod.getUri()),
      ],
      providers: [ConfigService],
    }).compile();
    sessionService = moduleReference.get(SessionService);
  });

  afterAll(async () => {
    await mongod.stop();
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const form = SessionDTO.fake({});
      const result = await sessionService.create(form);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const form = SessionDTO.fake({});
      const created = await sessionService.create(form);
      expect(created._id).toBeDefined();
      const found = await sessionService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const source = Types.ObjectId().toHexString();
      const forms = [
        SessionDTO.fake({ source }),
        SessionDTO.fake({ source }),
        SessionDTO.fake({ source }),
      ];
      await sessionService.create(forms[0]);
      await sessionService.create(forms[1]);
      await sessionService.create(forms[2]);
      const results = await sessionService.findMany({ source });
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const form = SessionDTO.fake({ source: original });
      const created = await sessionService.create(form);
      expect(created._id).toBeDefined();
      const result = await sessionService.update(created, {
        source: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await sessionService.findById(created);
      expect(found.source).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = SessionDTO.fake({});
      const created = await sessionService.create(form);
      expect(created._id).toBeDefined();
      await sessionService.delete(created);
      const found = await sessionService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});

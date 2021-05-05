import { ConfigModule } from '@automagical/config';
import { SchemaDTO } from '@automagical/contracts/formio-sdk';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';
import { SchemaService } from '../schema.service';

describe('schema', () => {
  let schemaService: SchemaService;
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
    schemaService = moduleReference.get(SchemaService);
  });

  afterAll(async () => {
    await mongod.stop();
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const form = SchemaDTO.fake({});
      const result = await schemaService.create(form);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const form = SchemaDTO.fake({});
      const created = await schemaService.create(form);
      expect(created._id).toBeDefined();
      const found = await schemaService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const value = faker.random.alphaNumeric(20);
      const forms = [
        SchemaDTO.fake({ value }),
        SchemaDTO.fake({ value }),
        SchemaDTO.fake({ value }),
      ];
      await schemaService.create(forms[0]);
      await schemaService.create(forms[1]);
      await schemaService.create(forms[2]);
      const results = await schemaService.findMany({ value });
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const form = SchemaDTO.fake({ value: original });
      const created = await schemaService.create(form);
      expect(created._id).toBeDefined();
      const result = await schemaService.update(created, {
        value: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await schemaService.findById(created);
      expect(found.value).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = SchemaDTO.fake({});
      const created = await schemaService.create(form);
      expect(created._id).toBeDefined();
      await schemaService.delete(created);
      const found = await schemaService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});

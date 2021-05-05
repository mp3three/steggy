import { ConfigModule } from '@automagical/config';
import { FormDTO } from '@automagical/contracts/formio-sdk';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';
import { FormService } from '../form.service';

describe('token', () => {
  let tokenService: FormService;
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
    tokenService = moduleReference.get(FormService);
  });

  afterAll(async () => {
    await mongod.stop();
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const form = FormDTO.fake({});
      const result = await tokenService.create(form);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const form = FormDTO.fake({});
      const created = await tokenService.create(form);
      expect(created._id).toBeDefined();
      const found = await tokenService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to findOne by name', async () => {
      expect.assertions(2);
      const form = FormDTO.fake({});
      const created = await tokenService.create(form);
      expect(created._id).toBeDefined();
      const found = await tokenService.findByName(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const action = faker.random.alphaNumeric(20);
      const forms = [
        FormDTO.fake({ action }),
        FormDTO.fake({ action }),
        FormDTO.fake({ action }),
      ];
      await tokenService.create(forms[0]);
      await tokenService.create(forms[1]);
      await tokenService.create(forms[2]);
      const results = await tokenService.findMany({ action });
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const form = FormDTO.fake({ title: original });
      const created = await tokenService.create(form);
      expect(created._id).toBeDefined();
      const result = await tokenService.update(created, {
        title: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await tokenService.findById(created);
      expect(found.title).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = FormDTO.fake({});
      const created = await tokenService.create(form);
      expect(created._id).toBeDefined();
      await tokenService.delete(created);
      const found = await tokenService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});

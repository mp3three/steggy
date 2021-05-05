import { ConfigModule } from '@automagical/config';
import { RoleDTO } from '@automagical/contracts/formio-sdk';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';
import { RoleService } from '../role.service';

describe('role', () => {
  let roleService: RoleService;
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
    roleService = moduleReference.get(RoleService);
  });

  afterAll(async () => {
    await mongod.stop();
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const form = RoleDTO.fake({});
      const result = await roleService.create(form);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const form = RoleDTO.fake({});
      const created = await roleService.create(form);
      expect(created._id).toBeDefined();
      const found = await roleService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const description = faker.random.alphaNumeric(20);
      const forms = [
        RoleDTO.fake({ description }),
        RoleDTO.fake({ description }),
        RoleDTO.fake({ description }),
      ];
      await roleService.create(forms[0]);
      await roleService.create(forms[1]);
      await roleService.create(forms[2]);
      const results = await roleService.findMany({ description });
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const form = RoleDTO.fake({ title: original });
      const created = await roleService.create(form);
      expect(created._id).toBeDefined();
      const result = await roleService.update(created, {
        title: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await roleService.findById(created);
      expect(found.title).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = RoleDTO.fake({});
      const created = await roleService.create(form);
      expect(created._id).toBeDefined();
      await roleService.delete(created);
      const found = await roleService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});

import { FormDTO } from '@formio/contracts/formio-sdk';
import { ConfigModule, queryToControl } from '@formio/utilities';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { FormSchema } from '../schema';
import { FormPersistenceMongoService } from './form.service';

describe('formPersistenceMongoService', () => {
  let formService: FormPersistenceMongoService;
  const logger = pino();

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        ConfigModule.register('jest-test'),
        MongooseModule.forFeature([{ name: FormDTO.name, schema: FormSchema }]),
        LoggerModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO, { useCreateIndex: true }),
      ],
      providers: [ConfigService, FormPersistenceMongoService],
    }).compile();
    formService = moduleReference.get(FormPersistenceMongoService);
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const form = FormDTO.fake({});
      const result = await formService.create(form);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const form = FormDTO.fake({});
      const created = await formService.create(form);
      expect(created._id).toBeDefined();
      const found = await formService.findById(created._id, {});
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to findOne by name', async () => {
      expect.assertions(2);
      const form = FormDTO.fake({});
      const created = await formService.create(form);
      expect(created._id).toBeDefined();
      const found = await formService.findByName(created.name, {});
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
      await formService.create(forms[0]);
      await formService.create(forms[1]);
      await formService.create(forms[2]);
      const results = await formService.findMany(
        queryToControl({ action }),
        {},
      );
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const form = FormDTO.fake({ title: original });
      const created = await formService.create(form);
      expect(created._id).toBeDefined();
      const result = await formService.update(
        {
          ...created,
          title: updated,
        },
        {},
      );
      expect(result._id).toStrictEqual(created._id);
      const found = await formService.findById(created._id, {});
      expect(found.title).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = FormDTO.fake({});
      const created = await formService.create(form);
      expect(created._id).toBeDefined();
      await formService.delete(created, {});
      const found = await formService.findById(created._id, {});
      expect(found).toBeFalsy();
    });
  });
});

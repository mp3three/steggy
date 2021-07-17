import { ActionItemDTO, FormDTO } from '@automagical/contracts/formio-sdk';
import { ConfigModule } from '@automagical/utilities';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { ActionItemPersistenceMongoService } from '..';
import { ActionItemSchema } from '../schema';

describe('actionItemPersistenceMongoService', () => {
  let actionItemService: ActionItemPersistenceMongoService;
  const logger = pino();

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        ConfigModule.register('jest-test'),
        MongooseModule.forFeature([
          { name: ActionItemDTO.name, schema: ActionItemSchema },
        ]),
        LoggerModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO, { useCreateIndex: true }),
      ],
      providers: [ConfigService, ActionItemPersistenceMongoService],
    }).compile();
    actionItemService = moduleReference.get(ActionItemPersistenceMongoService);
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const actionItem = ActionItemDTO.fake({});
      const result = await actionItemService.create(actionItem);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);
      const form = FormDTO.fake({}, true);
      const actionItem = ActionItemDTO.fake({
        form: form._id,
      });
      const created = await actionItemService.create(actionItem);
      expect(created._id).toBeDefined();
      const found = await actionItemService.findById(created._id, form);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const form = FormDTO.fake({}, true);
      const formId = form._id;
      const forms = [
        ActionItemDTO.fake({ form: formId }),
        ActionItemDTO.fake({ form: formId }),
        ActionItemDTO.fake({ form: formId }),
      ];
      await actionItemService.create(forms[0]);
      await actionItemService.create(forms[1]);
      await actionItemService.create(forms[2]);
      const results = await actionItemService.findMany({}, form);
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';
      const form = FormDTO.fake({}, true);
      const actionItem = ActionItemDTO.fake({
        form: form._id,
        title: original,
      });
      const created = await actionItemService.create(actionItem);
      expect(created._id).toBeDefined();
      const result = await actionItemService.update(
        {
          ...created,
          title: updated,
        },
        form,
      );
      expect(result._id).toStrictEqual(created._id);
      const found = await actionItemService.findById(created._id, form);
      expect(found.title).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = FormDTO.fake({}, true);
      const actionItem = ActionItemDTO.fake({
        form: form._id,
      });
      const created = await actionItemService.create(actionItem);
      expect(created._id).toBeDefined();
      await actionItemService.delete(created, form);
      const found = await actionItemService.findById(created._id, form);
      expect(found).toBeFalsy();
    });
  });
});

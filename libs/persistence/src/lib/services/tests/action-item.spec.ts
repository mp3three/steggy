import { ConfigModule } from '@automagical/config';
import { ActionItemDTO } from '@automagical/contracts/formio-sdk';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';
import { ActionItemPersistenceMongoService } from '..';

describe('action-item', () => {
  let actionItemService: ActionItemPersistenceMongoService;
  const logger = pino();

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        ConfigModule.register('jest-test'),
        PersistenceModule.forFeature(),
        LoggerModule.forRoot(),
        PersistenceModule.forRoot(process.env.MONGO),
      ],
      providers: [ConfigService],
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

      const form = ActionItemDTO.fake({});
      const created = await actionItemService.create(form);
      expect(created._id).toBeDefined();
      const found = await actionItemService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const form = Types.ObjectId().toHexString();
      const forms = [
        ActionItemDTO.fake({ form }),
        ActionItemDTO.fake({ form }),
        ActionItemDTO.fake({ form }),
      ];
      await actionItemService.create(forms[0]);
      await actionItemService.create(forms[1]);
      await actionItemService.create(forms[2]);
      const results = await actionItemService.findMany({ form });
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const form = ActionItemDTO.fake({ title: original });
      const created = await actionItemService.create(form);
      expect(created._id).toBeDefined();
      const result = await actionItemService.update(created, {
        title: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await actionItemService.findById(created);
      expect(found.title).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = ActionItemDTO.fake({});
      const created = await actionItemService.create(form);
      expect(created._id).toBeDefined();
      await actionItemService.delete(created);
      const found = await actionItemService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});

import { ConfigModule } from '@automagical/config';
import { ActionDTO } from '@automagical/contracts/formio-sdk';
import { ActionPersistenceMongoService } from '@automagical/persistence';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';

describe('action', () => {
  let actionService: ActionPersistenceMongoService;
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
    actionService = moduleReference.get(ActionPersistenceMongoService);
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const form = ActionDTO.fake({});
      const result = await actionService.create(form);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const form = ActionDTO.fake({});
      const created = await actionService.create(form);
      expect(created._id).toBeDefined();
      const found = await actionService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const machineName = faker.random.alphaNumeric(20);
      const forms = [
        ActionDTO.fake({ machineName }),
        ActionDTO.fake({ machineName }),
        ActionDTO.fake({ machineName }),
      ];
      await actionService.create(forms[0]);
      await actionService.create(forms[1]);
      await actionService.create(forms[2]);
      const results = await actionService.findMany({ machineName });
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const form = ActionDTO.fake({ title: original });
      const created = await actionService.create(form);
      expect(created._id).toBeDefined();
      const result = await actionService.update(created, {
        title: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await actionService.findById(created);
      expect(found.title).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = ActionDTO.fake({});
      const created = await actionService.create(form);
      expect(created._id).toBeDefined();
      await actionService.delete(created);
      const found = await actionService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});

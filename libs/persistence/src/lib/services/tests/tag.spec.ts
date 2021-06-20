import { ConfigModule } from '@automagical/config';
import { TagDTO } from '@automagical/contracts/formio-sdk';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';
import { TagPersistenceMongoService } from '../tag.service';

describe('tag', () => {
  let tagService: TagPersistenceMongoService;
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
    tagService = moduleReference.get(TagPersistenceMongoService);
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const form = TagDTO.fake({});
      const result = await tagService.create(form);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const form = TagDTO.fake({});
      const created = await tagService.create(form);
      expect(created._id).toBeDefined();
      const found = await tagService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const description = faker.random.alphaNumeric(20);
      const forms = [
        TagDTO.fake({ description }),
        TagDTO.fake({ description }),
        TagDTO.fake({ description }),
      ];
      await tagService.create(forms[0]);
      await tagService.create(forms[1]);
      await tagService.create(forms[2]);
      const results = await tagService.findMany({ description });
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const form = TagDTO.fake({ description: original });
      const created = await tagService.create(form);
      expect(created._id).toBeDefined();
      const result = await tagService.update(created, {
        description: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await tagService.findById(created);
      expect(found.description).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const form = TagDTO.fake({});
      const created = await tagService.create(form);
      expect(created._id).toBeDefined();
      await tagService.delete(created);
      const found = await tagService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});

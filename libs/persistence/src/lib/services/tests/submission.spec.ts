import { ConfigModule } from '@automagical/config';
import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';
import { SubmissionPersistenceMongoService } from '../submission.service';

describe('submission', () => {
  let submissionService: SubmissionPersistenceMongoService;
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
    submissionService = moduleReference.get(SubmissionPersistenceMongoService);
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const submission = SubmissionDTO.fake({});
      const result = await submissionService.create(submission);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const submission = SubmissionDTO.fake({});
      const created = await submissionService.create(submission);
      expect(created._id).toBeDefined();
      const found = await submissionService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);

      const form = faker.random.alphaNumeric(20);
      const submissions = [
        SubmissionDTO.fake({ form }),
        SubmissionDTO.fake({ form }),
        SubmissionDTO.fake({ form }),
      ];
      await submissionService.create(submissions[0]);
      await submissionService.create(submissions[1]);
      await submissionService.create(submissions[2]);
      const results = await submissionService.findMany(
        new Map(Object.entries({ form })),
      );
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const submission = SubmissionDTO.fake({ form: original });
      const created = await submissionService.create(submission);
      expect(created._id).toBeDefined();
      const result = await submissionService.update(created, {
        form: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await submissionService.findById(created);
      expect(found.form).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const submission = SubmissionDTO.fake({});
      const created = await submissionService.create(submission);
      expect(created._id).toBeDefined();
      await submissionService.delete(created);
      const found = await submissionService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});

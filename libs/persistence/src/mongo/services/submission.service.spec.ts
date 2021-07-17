import {
  FormDTO,
  ProjectDTO,
  SUBMISSION_STATES,
  SubmissionDTO,
} from '@formio/contracts/formio-sdk';
import { ConfigModule, queryToControl } from '@formio/utilities';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { EncryptionService } from '../../services/encryption.service';
import { SubmissionSchema } from '../schema';
import { SubmissionPersistenceMongoService } from './submission.service';

describe('submissionPersistenceMongoService', () => {
  let submissionService: SubmissionPersistenceMongoService;
  const logger = pino();
  const project = ProjectDTO.fake({}, true);
  const form = FormDTO.fake(
    {
      project: project._id,
    },
    true,
  );
  const locals = { form, project };
  const ids = {
    form: form._id,
    project: project._id,
  };

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        ConfigModule.register('jest-test'),
        MongooseModule.forFeature([
          { name: SubmissionDTO.name, schema: SubmissionSchema },
        ]),
        LoggerModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO, { useCreateIndex: true }),
      ],
      providers: [
        ConfigService,
        SubmissionPersistenceMongoService,
        EncryptionService,
      ],
    }).compile();
    submissionService = moduleReference.get(SubmissionPersistenceMongoService);
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const submission = SubmissionDTO.fake(ids);
      const result = await submissionService.create(submission, locals);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const submission = SubmissionDTO.fake(ids);
      const created = await submissionService.create(submission, locals);
      expect(created._id).toBeDefined();
      const found = await submissionService.findById(created._id, locals);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);
      const now = Date.now();
      const data = { now };
      const submissions = [
        SubmissionDTO.fake({ ...ids, data }),
        SubmissionDTO.fake({ ...ids, data }),
        SubmissionDTO.fake({ ...ids, data }),
      ];
      await submissionService.create(submissions[0], locals);
      await submissionService.create(submissions[1], locals);
      await submissionService.create(submissions[2], locals);
      const results = await submissionService.findMany(
        queryToControl({ 'data.now': now.toString() }),
        locals,
      );
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const submission = SubmissionDTO.fake({
        ...ids,
        state: SUBMISSION_STATES.submitted,
      });
      const created = await submissionService.create(submission, locals);
      expect(created._id).toBeDefined();
      const result = await submissionService.update(
        {
          ...created,
          state: SUBMISSION_STATES.testing,
        },
        locals,
      );
      expect(result._id).toStrictEqual(created._id);
      const found = await submissionService.findById(created._id, locals);
      expect(found.state).toStrictEqual(SUBMISSION_STATES.testing);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const submission = SubmissionDTO.fake(ids);
      const created = await submissionService.create(submission, locals);
      expect(created._id).toBeDefined();
      await submissionService.delete(created, locals);
      const found = await submissionService.findById(created._id, locals);
      expect(found).toBeFalsy();
    });
  });
});

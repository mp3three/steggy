process.env.DEBUG = '*';
import { ConfigModule } from '@automagical/config';
import { UserDTO } from '@automagical/contracts/formio-sdk';
import { FetchService, MockFetchService } from '@automagical/fetch';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import pino from 'pino';

import { FormioSdkService } from '../formio-sdk.service';
import { SubmissionService } from '../submission.service';

/**
 * WIP / TDD thing. Made while testing working FIO-1285, code may be useful later
 */
describe('submission-service', () => {
  let formioSdkService: FormioSdkService;
  let submissionService: SubmissionService;
  const logger = pino();

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [ConfigModule.register('formio-sdk-test')],
      providers: [
        FormioSdkService,
        ConfigService,
        SubmissionService,
        {
          provide: FetchService,
          useClass: MockFetchService,
        },
      ],
    }).compile();

    formioSdkService = moduleReference.get(FormioSdkService);
    submissionService = moduleReference.get(SubmissionService);

    await formioSdkService['onModuleInit']();
  });

  describe('patch-flow', () => {
    const email = faker.internet.email();
    const fullName = faker.name.firstName();
    const password = faker.random.alphaNumeric(10);
    logger.info({
      email,
      fullName,
      password,
    });

    it('should be able to patch users', async () => {
      expect.assertions(0);
      const id = '606fa8227fa964e96a09fdbd';
      const project = 'formio';
      const form = 'user';
      const result = await submissionService.patch<UserDTO>({
        body: JSON.stringify([
          {
            op: 'remove',
            path: '/data/fullName',
          },
        ]),
        form,
        id,
        project,
      });
      logger.error(result);
      const user = await submissionService.get<UserDTO>({ form, id, project });
      logger.warn(user);
    });
  });
});

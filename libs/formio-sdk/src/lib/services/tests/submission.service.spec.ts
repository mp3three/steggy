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
    // it('should register a user', async () => {
    //   const user = await formioSdkService.userCreate({
    //     email,
    //     name: fullName,
    //     password,
    //   });
    //   expect(user).toBeDefined();
    //   console.info(user._id);
    // });

    // public async verifySubmission(args: {
    //   project: string;
    //   resource: string;
    //   _id: string;
    // }) {
    //   return this.submissionService.patch({
    //     ...args,
    //     body: [
    //       {
    //         op: 'add',
    //         path: '/metadata/verified',
    //         value: dayjs().toISOString(),
    //       },
    //     ],
    //   });
    // }

    it('should be able to patch users', async () => {
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

    // it('should call Fetch.fetch', async () => {
    //   expect(formioSdkService.jwtToken).toBeTruthy();
    //   const userList = await submissionService.list({
    //     project: 'formio',
    //     form: 'user',
    //   });
    //   expect(userList.length).toBeGreaterThan(0);
    // jest.spyOn(Fetch, 'fetch').mockImplementation(() => null);
    // const jwtToken = faker.datatype.uuid();
    // formioSdkService.jwtToken = jwtToken;
    // formioSdkService.fetch({});
    // expect(Fetch.fetch).toHaveBeenCalled();
    // });
  });
});

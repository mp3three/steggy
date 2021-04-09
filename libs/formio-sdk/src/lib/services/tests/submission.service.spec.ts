process.env.DEBUG = '*';
import { ConfigModule } from '@automagical/config';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { FormioSdkService } from '../formio-sdk.service';
import { SubmissionService } from '../submission.service';
import * as faker from 'faker';
import { iLogger, Logger } from '@automagical/logger';
import { UserDTO } from '@automagical/contracts/formio-sdk';

/**
 * WIP / TDD thing. Made while testing working FIO-1285, code may be useful later
 */
xdescribe('submission-service', () => {
  let formioSdkService: FormioSdkService;
  let submissionService: SubmissionService;
  let logger: iLogger;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.register({})],
      providers: [FormioSdkService, ConfigService, SubmissionService],
    }).compile();

    formioSdkService = moduleRef.get(FormioSdkService);
    submissionService = moduleRef.get(SubmissionService);
    logger = Logger('submission-service.spec');

    await formioSdkService.onModuleInit();
  });

  describe('patch-flow', () => {
    const email = faker.internet.email();
    const fullName = faker.name.firstName();
    const password = faker.random.alphaNumeric(10);
    // it('should register a user', async () => {
    //   const user = await formioSdkService.userCreate({
    //     email,
    //     name: fullName,
    //     password,
    //   });
    //   expect(user).toBeDefined();
    //   console.log(user._id);
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
        project,
        form,
        id,
        body: JSON.stringify([
          {
            op: 'remove',
            path: '/data/fullName',
          },
        ]),
      });
      logger.crit(result);
      const user = await submissionService.get<UserDTO>({ project, form, id });
      logger.alert(user);
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

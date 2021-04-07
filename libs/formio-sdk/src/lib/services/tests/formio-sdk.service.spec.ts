import { Test } from '@nestjs/testing';
import { FormioSdkService } from '../formio-sdk.service';
import * as faker from 'faker';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Fetch } from '@automagical/fetch';

describe('formio-sdk', () => {
  let formioSdkService: FormioSdkService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => {
              return {
                libs: {
                  'formio-sdk': {
                    PORTAL_BASE_URL: 'FOO',
                  },
                },
              };
            },
          ],
        }),
      ],
      providers: [FormioSdkService, ConfigService],
    }).compile();

    formioSdkService = moduleRef.get(FormioSdkService);

    await formioSdkService.onModuleInit();
  });

  describe('byId', () => {
    it('should return arg if arg is string', () => {
      const str = faker.datatype.uuid();
      expect(formioSdkService.id(str)).toBe(str);
    });
    it('should return _id if type is obj', () => {
      const str = faker.datatype.uuid();
      expect(formioSdkService.id({ _id: str })).toBe(str);
    });
  });

  describe('fetch', () => {
    afterEach(() => {});

    it('should call Fetch.fetch', () => {
      jest.spyOn(Fetch, 'fetch').mockImplementation(() => null);
      formioSdkService.fetch({});
      expect(Fetch.fetch).toHaveBeenCalled();
    });
  });
});

import {
  API_KEY,
  PORTAL_BASE_URL,
  PROJECT_URL,
} from '@automagical/contracts/config';
import { LIB_TESTING } from '@automagical/contracts/constants';
import {
  DEFAULT_TEST_SETTINGS,
  MockFetchService,
  UpdatableConfigService,
} from '@automagical/testing';
import {
  ConfigModule,
  FetchService,
  UtilitiesModule,
} from '@automagical/utilities';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

import { FormService } from './form.service';
import { FormioSdkService } from './formio-sdk.service';

describe('formio-sdk service', () => {
  let formioSdkService: FormioSdkService;
  let logger: PinoLogger;
  let configService: UpdatableConfigService;
  let fetchService: FetchService;

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        UtilitiesModule,
        ConfigModule.register(LIB_TESTING, DEFAULT_TEST_SETTINGS),
      ],
      providers: [
        FormService,
        FormioSdkService,
        MockFetchService,
        UpdatableConfigService,
      ],
    })
      .overrideProvider(FetchService)
      .useClass(MockFetchService)
      .overrideProvider(ConfigService)
      .useClass(UpdatableConfigService)
      .compile();

    formioSdkService = moduleReference.get(FormioSdkService);
    configService = moduleReference.get(UpdatableConfigService);
    fetchService = formioSdkService['fetchService'];
    logger = formioSdkService['logger'];
  });

  describe('fetch', () => {
    it('should exist', () => {
      expect.assertions(1);
      expect(formioSdkService.fetch).toBeDefined();
    });

    it('should prioritize PROJECT_URL', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(fetchService, 'fetch');
      configService.set(PROJECT_URL, PROJECT_URL);
      await formioSdkService.fetch({});
      expect(spy).toHaveBeenCalledWith({
        baseUrl: PROJECT_URL,
      });
      configService.restore();
      spy.mockRestore();
    });

    it('should use PORTAL_BASE_URL if no project url available', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(fetchService, 'fetch');
      configService.set(PROJECT_URL, '');
      configService.set(PORTAL_BASE_URL, PORTAL_BASE_URL);
      await formioSdkService.fetch({});
      expect(spy).toHaveBeenCalledWith({
        baseUrl: PORTAL_BASE_URL,
      });
      configService.restore();
      spy.mockRestore();
    });

    it('provides API_KEYs if available', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(fetchService, 'fetch');
      configService.set(API_KEY, API_KEY);
      await formioSdkService.fetch({});
      expect(spy).toHaveBeenCalledWith({
        apiKey: API_KEY,
      });
      configService.restore();
      spy.mockRestore();
    });
  });
});

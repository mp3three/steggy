import { FetchService, MockFetchService } from '@automagical/fetch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { LoggerModule } from 'nestjs-pino';

import { FormioSdkService } from '../formio-sdk.service';

describe('formio-sdk', () => {
  const PORTAL_BASE_URL = 'baseUrl';
  const API_KEY = 'API_KEY';
  // const JWT_TOKEN = 'JWT_TOKEN';
  let formioSdkService: FormioSdkService;
  let fetchService: MockFetchService;

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        ConfigModule.forRoot({
          load: [
            () => {
              return {
                libs: {
                  'formio-sdk': {
                    API_KEY,
                    PORTAL_BASE_URL,
                  },
                },
              };
            },
          ],
        }),
      ],
      providers: [
        FormioSdkService,
        ConfigService,
        {
          provide: FetchService,
          useClass: MockFetchService,
        },
      ],
    }).compile();

    formioSdkService = moduleReference.get(FormioSdkService);
    fetchService = moduleReference.get(FetchService);

    await formioSdkService['onModuleInit']();
  });

  describe('byId', () => {
    it('byId should be defined', () =>
      expect(formioSdkService.id).toBeDefined());

    it('should return arg if arg is string', () => {
      expect.assertions(1);
      const id = faker.datatype.uuid();
      expect(formioSdkService.id(id)).toBe(id);
    });

    it('should return _id if type is obj', () => {
      expect.assertions(1);
      const string = faker.datatype.uuid();
      expect(formioSdkService.id({ _id: string })).toBe(string);
    });
  });

  describe('fetch', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('fetch should be defined', () =>
      expect(formioSdkService.fetch).toBeDefined());

    it('should call Fetch.fetch', () => {
      expect.assertions(1);
      jest.spyOn(fetchService, 'fetch');
      const jwtToken = faker.datatype.uuid();
      formioSdkService.jwtToken = jwtToken;
      formioSdkService.fetch({});
      expect(fetchService.fetch).toHaveBeenCalledTimes(1);
    });

    it('should set standard values', () => {
      expect.assertions(1);
      const out: string = undefined;
      jest.spyOn(fetchService, 'fetch').mockImplementation(async () => {
        return out;
      });
      const jwtToken = faker.datatype.uuid();
      formioSdkService.jwtToken = jwtToken;
      formioSdkService.fetch({});
      expect(fetchService.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: API_KEY,
          baseUrl: PORTAL_BASE_URL,
          token: jwtToken,
        }),
      );
    });

    it('should not override provided values', () => {
      expect.assertions(1);
      const out: string = undefined;
      jest.spyOn(fetchService, 'fetch').mockImplementation(async () => {
        return out;
      });
      const jwtToken = faker.datatype.uuid();
      formioSdkService.jwtToken = jwtToken;
      formioSdkService.fetch({
        apiKey: 'BAR',
        baseUrl: 'FOO',
        token: 'banana',
      });
      expect(fetchService.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'BAR',
          baseUrl: 'FOO',
          token: 'banana',
        }),
      );
    });
  });

  describe('projectAccessInfo', () => {
    it('projectAccessInfo should be defined', () =>
      expect(formioSdkService.projectAccessInfo).toBeDefined());
  });

  describe('projectAdminLogin', () => {
    it('projectAdminLogin should be defined', () =>
      expect(formioSdkService.projectAdminLogin).toBeDefined());
  });

  describe('projectAuthToken', () => {
    it('projectAuthToken should be defined', () =>
      expect(formioSdkService.projectAuthToken).toBeDefined());
  });

  describe('projectCreate', () => {
    it('projectCreate should be defined', () =>
      expect(formioSdkService.projectCreate).toBeDefined());
  });

  describe('projectCreateAdmin', () => {
    it('projectCreateAdmin should be defined', () =>
      expect(formioSdkService.projectCreateAdmin).toBeDefined());
  });

  describe('projectDelete', () => {
    it('projectDelete should be defined', () =>
      expect(formioSdkService.projectDelete).toBeDefined());
  });

  describe('projectExport', () => {
    it('projectExport should be defined', () =>
      expect(formioSdkService.projectExport).toBeDefined());
  });

  describe('projectGet', () => {
    it('projectGet should be defined', () =>
      expect(formioSdkService.projectGet).toBeDefined());
  });

  describe('projectList', () => {
    it('projectList should be defined', () =>
      expect(formioSdkService.projectList).toBeDefined());
  });

  describe('projectRoleCreate', () => {
    it('projectRoleCreate should be defined', () =>
      expect(formioSdkService.projectRoleCreate).toBeDefined());
  });

  describe('projectRoleList', () => {
    it('projectRoleList should be defined', () =>
      expect(formioSdkService.projectRoleList).toBeDefined());
  });

  describe('projectRoleUpdate', () => {
    it('projectRoleUpdate should be defined', () =>
      expect(formioSdkService.projectRoleUpdate).toBeDefined());
  });

  describe('projectTemplateImport', () => {
    it('projectTemplateImport should be defined', () =>
      expect(formioSdkService.projectTemplateImport).toBeDefined());
  });

  describe('projectUpdate', () => {
    it('projectUpdate should be defined', () =>
      expect(formioSdkService.projectUpdate).toBeDefined());
  });

  describe('userCreate', () => {
    it('userCreate should be defined', () =>
      expect(formioSdkService.userCreate).toBeDefined());
  });

  describe('userFetch', () => {
    it('userFetch should be defined', () =>
      expect(formioSdkService.userFetch).toBeDefined());
  });

  describe('userLogin', () => {
    it('userLogin should be defined', () =>
      expect(formioSdkService.userLogin).toBeDefined());
  });

  describe('userLogout', () => {
    it('userLogout should be defined', () =>
      expect(formioSdkService.userLogout).toBeDefined());
  });

  describe('projectUrl', () => {
    it('projectUrl should be defined', () =>
      expect(formioSdkService['projectUrl']).toBeDefined());
  });
});

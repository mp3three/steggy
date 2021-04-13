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
    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        ConfigModule.forRoot({
          load: [
            () => {
              return {
                libs: {
                  'formio-sdk': {
                    PORTAL_BASE_URL,
                    API_KEY,
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

    formioSdkService = moduleRef.get(FormioSdkService);
    fetchService = moduleRef.get(FetchService);

    await formioSdkService.onModuleInit();
  });

  describe('byId', () => {
    it('should be defined', () => expect(formioSdkService.id).toBeDefined());

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
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should be defined', () => expect(formioSdkService.fetch).toBeDefined());

    it('should call Fetch.fetch', () => {
      jest.spyOn(fetchService, 'fetch');
      const jwtToken = faker.datatype.uuid();
      formioSdkService.jwtToken = jwtToken;
      formioSdkService.fetch({});
      expect(fetchService.fetch).toHaveBeenCalled();
    });

    it('should set standard values', () => {
      jest.spyOn(fetchService, 'fetch').mockImplementation(() => null);
      const jwtToken = faker.datatype.uuid();
      formioSdkService.jwtToken = jwtToken;
      formioSdkService.fetch({});
      expect(fetchService.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: PORTAL_BASE_URL,
          apiKey: API_KEY,
          token: jwtToken,
        }),
      );
    });

    it('should not override provided values', () => {
      jest.spyOn(fetchService, 'fetch').mockImplementation(() => null);
      const jwtToken = faker.datatype.uuid();
      formioSdkService.jwtToken = jwtToken;
      formioSdkService.fetch({
        baseUrl: 'FOO',
        apiKey: 'BAR',
        token: 'banana',
      });
      expect(fetchService.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'FOO',
          apiKey: 'BAR',
          token: 'banana',
        }),
      );
    });
  });

  describe('projectAccessInfo', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectAccessInfo).toBeDefined());
  });
  describe('projectAdminLogin', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectAdminLogin).toBeDefined());
  });
  describe('projectAuthToken', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectAuthToken).toBeDefined());
  });
  describe('projectCreate', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectCreate).toBeDefined());
  });
  describe('projectCreateAdmin', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectCreateAdmin).toBeDefined());
  });
  describe('projectDelete', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectDelete).toBeDefined());
  });
  describe('projectExport', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectExport).toBeDefined());
  });
  describe('projectGet', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectGet).toBeDefined());
  });
  describe('projectList', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectList).toBeDefined());
  });
  describe('projectRoleCreate', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectRoleCreate).toBeDefined());
  });
  describe('projectRoleList', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectRoleList).toBeDefined());
  });
  describe('projectRoleUpdate', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectRoleUpdate).toBeDefined());
  });
  describe('projectTemplateImport', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectTemplateImport).toBeDefined());
  });
  describe('projectUpdate', () => {
    it('should be defined', () =>
      expect(formioSdkService.projectUpdate).toBeDefined());
  });
  describe('userCreate', () => {
    it('should be defined', () =>
      expect(formioSdkService.userCreate).toBeDefined());
  });
  describe('userFetch', () => {
    it('should be defined', () =>
      expect(formioSdkService.userFetch).toBeDefined());
  });
  describe('userLogin', () => {
    it('should be defined', () =>
      expect(formioSdkService.userLogin).toBeDefined());
  });
  describe('userLogout', () => {
    it('should be defined', () =>
      expect(formioSdkService.userLogout).toBeDefined());
  });
  describe('projectUrl', () => {
    it('should be defined', () =>
      expect(formioSdkService['projectUrl']).toBeDefined());
  });
});

import { CrudOptions } from '@automagical/contracts';
import { LIB_TESTING } from '@automagical/contracts/constants';
import { FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';
import {
  HTTP_METHODS,
  ResultControlDTO,
} from '@automagical/contracts/utilities';
import { DEFAULT_TEST_SETTINGS, MockFetchService } from '@automagical/testing';
import {
  ConfigModule,
  FetchService,
  UtilitiesModule,
} from '@automagical/utilities';
import { Test } from '@nestjs/testing';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

import { FormService } from './form.service';
import { FormioSdkService } from './formio-sdk.service';

describe('form service', () => {
  let formService: FormService;
  let formioSdkService: FormioSdkService;
  let logger: PinoLogger;
  const project = ProjectDTO.fake({}, true);
  const partialAction: Pick<FormDTO, 'project'> = {
    project: project._id,
  };
  const options: CrudOptions = {
    project,
  };

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        UtilitiesModule,
        ConfigModule.register(LIB_TESTING, DEFAULT_TEST_SETTINGS),
      ],
      providers: [FormService, FormioSdkService],
    })
      .overrideProvider(FetchService)
      .useClass(MockFetchService)
      .compile();

    formioSdkService = moduleReference.get(FormioSdkService);
    formService = moduleReference.get(FormService);
    logger = formService['logger'];
  });

  describe('create', () => {
    it('should exist', () => {
      expect.assertions(1);
      expect(formService.create).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await formService.create(FormDTO.fake(partialAction), options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = FormDTO.fake(partialAction);
      const adminKey = 'foo';
      await formService.create(action, { auth: { adminKey }, ...options });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          adminKey,
          body: action,
          method: HTTP_METHODS.post,
        }),
      );
      spy.mockRestore();
    });

    it('correctly handles no auth', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = FormDTO.fake(partialAction);
      await formService.create(action, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: action,
          method: HTTP_METHODS.post,
        }),
      );
      spy.mockRestore();
    });
  });

  describe('delete', () => {
    it('should exist', () => {
      expect.assertions(1);
      expect(formService.delete).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await formService.delete(FormDTO.fake(partialAction), options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('generates correct urls with FormDTO inputs', async () => {
      expect.assertions(1);
      const action = FormDTO.fake(partialAction, true);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      await formService.delete(action, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(action._id),
        }),
      );
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = FormDTO.fake(partialAction, true);
      const adminKey = 'foo';
      await formService.delete(action, { auth: { adminKey }, ...options });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          adminKey,
          method: HTTP_METHODS.delete,
        }),
      );
      spy.mockRestore();
    });

    it('correctly handles no auth', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = FormDTO.fake(partialAction, true);
      await formService.delete(action, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: HTTP_METHODS.delete,
        }),
      );
      spy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should exist', () => {
      expect.assertions(1);
      expect(formService.findById).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await formService.findById('foo', options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = FormDTO.fake(partialAction, true);
      const adminKey = 'foo';
      const control: ResultControlDTO = {
        filters: new Set(),
      };
      await formService.findById(action._id, {
        auth: { adminKey },
        control,
        ...options,
      });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          adminKey,
          control,
          url: expect.stringContaining(action._id),
        }),
      );
      spy.mockRestore();
    });

    it('correctly handles no auth', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = FormDTO.fake(partialAction, true);
      await formService.findById(action._id, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(action._id),
        }),
      );
      spy.mockRestore();
    });
  });

  describe('findMany', () => {
    it('should exist', () => {
      expect.assertions(1);
      expect(formService.findMany).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await formService.findMany({}, options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const adminKey = 'foo';
      const control: ResultControlDTO = {
        filters: new Set(),
      };
      await formService.findMany(control, {
        auth: { adminKey },
        ...options,
      });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          adminKey,
          control,
          url: expect.stringContaining('form'),
        }),
      );
      spy.mockRestore();
    });

    it('correctly handles no auth', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      await formService.findMany({}, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('form'),
        }),
      );
      spy.mockRestore();
    });
  });

  describe('findByName', () => {
    const name = Date.now().toString();

    it('should exist', () => {
      expect.assertions(1);
      expect(formService.findByName).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await formService.findByName(name, options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const adminKey = 'foo';
      const control: ResultControlDTO = {
        filters: new Set(),
      };
      await formService.findByName(name, {
        auth: { adminKey },
        control,
        ...options,
      });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          adminKey,
          control,
          url: expect.stringContaining(name),
        }),
      );
      spy.mockRestore();
    });

    it('correctly handles no auth', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      await formService.findByName(name, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(name),
        }),
      );
      spy.mockRestore();
    });
  });

  describe('update', () => {
    it('should exist', () => {
      expect.assertions(1);
      expect(formService.update).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await formService.update(FormDTO.fake(partialAction, true), options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = FormDTO.fake(partialAction, true);
      const adminKey = 'foo';
      await formService.update(action, { auth: { adminKey }, ...options });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          adminKey,
          body: action,
          method: HTTP_METHODS.put,
          url: expect.stringContaining(action._id),
        }),
      );
      spy.mockRestore();
    });

    it('correctly handles no auth', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = FormDTO.fake(partialAction, true);
      await formService.update(action, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: action,
          method: HTTP_METHODS.put,
        }),
      );
      spy.mockRestore();
    });
  });
});

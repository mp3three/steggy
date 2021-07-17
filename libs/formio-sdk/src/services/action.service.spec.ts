import { CrudOptions } from '@automagical/contracts';
import { APIServerApplicationSettingsDTO } from '@automagical/contracts/config';
import { LIB_TESTING } from '@automagical/contracts/constants';
import { HTTP_METHODS, ResultControlDTO } from '@automagical/contracts/fetch';
import { ActionDTO, FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';
import { DEFAULT_TEST_SETTINGS, MockFetchService } from '@automagical/testing';
import { ConfigModule, FetchService, UtilitiesModule } from '@automagical/utilities';
import { Test } from '@nestjs/testing';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

import { ActionService } from './action.service';
import { FormioSdkService } from './formio-sdk.service';

describe('action service', () => {
  let actionService: ActionService;
  let formioSdkService: FormioSdkService;
  let logger: PinoLogger;
  const project = ProjectDTO.fake({}, true);
  const form = FormDTO.fake(
    {
      project: project._id,
    },
    true,
  );
  const partialAction: Pick<ActionDTO, 'project' | 'form'> = {
    form: form._id,
    project: project._id,
  };
  const options: CrudOptions = {
    form,
    project,
  };

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        UtilitiesModule,
        ConfigModule.register<APIServerApplicationSettingsDTO>(
          LIB_TESTING,
          DEFAULT_TEST_SETTINGS,
        ),
      ],
      providers: [ActionService, FormioSdkService],
    })
      .overrideProvider(FetchService)
      .useClass(MockFetchService)
      .compile();

    formioSdkService = moduleReference.get(FormioSdkService);
    actionService = moduleReference.get(ActionService);
    logger = actionService['logger'];
  });

  describe('create', () => {
    it('should exist', () => {
      expect.assertions(1);
      expect(actionService.create).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await actionService.create(ActionDTO.fake(partialAction), options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = ActionDTO.fake(partialAction);
      const adminKey = 'foo';
      await actionService.create(action, { auth: { adminKey }, ...options });
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
      const action = ActionDTO.fake(partialAction);
      await actionService.create(action, options);
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
      expect(actionService.delete).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await actionService.delete(ActionDTO.fake(partialAction), options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('generates correct urls with ActionDTO inputs', async () => {
      expect.assertions(1);
      const action = ActionDTO.fake(partialAction, true);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      await actionService.delete(action, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(action._id),
        }),
      );
      spy.mockRestore();
    });

    it('generates correct urls with string inputs', async () => {
      expect.assertions(1);
      const action = ActionDTO.fake(partialAction, true);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      await actionService.delete(action._id, options);
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
      const action = ActionDTO.fake(partialAction, true);
      const adminKey = 'foo';
      await actionService.delete(action, { auth: { adminKey }, ...options });
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
      const action = ActionDTO.fake(partialAction, true);
      await actionService.delete(action, options);
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
      expect(actionService.findById).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await actionService.findById('foo', options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = ActionDTO.fake(partialAction, true);
      const adminKey = 'foo';
      const control: ResultControlDTO = {
        filters: new Set(),
      };
      await actionService.findById(action._id, {
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
      const action = ActionDTO.fake(partialAction, true);
      await actionService.findById(action._id, options);
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
      expect(actionService.findMany).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await actionService.findMany({}, options);
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
      await actionService.findMany(control, {
        auth: { adminKey },
        ...options,
      });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          adminKey,
          control,
          url: expect.stringContaining('action'),
        }),
      );
      spy.mockRestore();
    });

    it('correctly handles no auth', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      await actionService.findMany({}, options);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('action'),
        }),
      );
      spy.mockRestore();
    });
  });

  describe('update', () => {
    it('should exist', () => {
      expect.assertions(1);
      expect(actionService.update).toBeDefined();
    });

    it('should be traced', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(logger, 'trace');
      await actionService.update(ActionDTO.fake(partialAction, true), options);
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    it('calls fetch correctly', async () => {
      expect.assertions(1);
      const spy = jest.spyOn(formioSdkService, 'fetch');
      const action = ActionDTO.fake(partialAction, true);
      const adminKey = 'foo';
      await actionService.update(action, { auth: { adminKey }, ...options });
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
      const action = ActionDTO.fake(partialAction, true);
      await actionService.update(action, options);
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

import { Test } from '@nestjs/testing';
import { FormioSdkService } from '../formio-sdk.service';
import * as faker from 'faker';
import { ConfigService } from '@nestjs/config';

describe('formio-sdk', () => {
  let formioSdkService: FormioSdkService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [FormioSdkService, ConfigService],
    }).compile();

    formioSdkService = moduleRef.get(FormioSdkService);
  });

  describe('byId', () => {
    it('should return arg if arg is string', () => {
      const str = faker.datatype.uuid();
      expect(formioSdkService.id(str)).toBe(str);
    });
  });
});

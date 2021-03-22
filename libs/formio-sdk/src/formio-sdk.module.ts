import { Module } from '@nestjs/common';
import {
  FormioSdkService,
  LicenseService,
  ResourceService,
  SubmissionService,
} from '.';
import { SDKConfig } from './typings';

@Module({
  providers: [
    FormioSdkService,
    ResourceService,
    SubmissionService,
    LicenseService,
    {
      provide: 'SDKConfig',
      useValue: Object.freeze({
        API_KEY: process.env.FORMIO_SDK_API_KEY,
        PORTAL_BASE_URL: process.env.FORMIO_SDK_PORTAL_BASE_URL,
        LICENSE_SERVER_BASE_URL: process.env.FORMIO_SDK_LICENSE_SERVER_BASE_URL,
        LOGIN_EMAIL: process.env.FORMIO_SDK_LOGIN_EMAIL,
        LOGIN_PASSWORD: process.env.FORMIO_SDK_LOGIN_PASSWORD,
        AUTH: {
          user: process.env.FORMIO_SDK_AUTH_user,
          password: process.env.FORMIO_SDK_AUTH_password,
        },
      } as SDKConfig),
    },
  ],
  exports: [
    FormioSdkService,
    ResourceService,
    SubmissionService,
    LicenseService,
    'SDKConfig',
  ],
})
export class FormioSdkModule {}

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const ServerSwaggerInit = (app: INestApplication): void => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('formio api server')
    .setDescription('Root level API routes')
    .setVersion('0.0.1')
    .setContact('Form.IO Support', 'https://form.io', 'support@form.io')
    .addTag('dto')
    .addTag('default', 'These routes have not been tagged')
    .addTag('role', 'Routes that manipulate roles')
    .addTag('delete', 'Routes that delete something')
    .addTag('action', 'Routes that deal with form actions')
    .addTag('search', 'Routes that utilize query params for doing searches')
    .addTag('create', 'Routes that perform inserts')
    .addTag('storage', 'Form file upload storage routes')
    .addTag('export', 'Routes that can be used for template import / export')
    .addTag('admin', 'Special server admin routes')
    .setLicense('LICENSE PLACEHOLDER', 'https://www.test.com')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
};

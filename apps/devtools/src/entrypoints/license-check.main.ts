// import { AutomagicalConfig, LOG_LEVEL } from '@formio/contracts/config';
// import { APP_DEVTOOLS } from '@formio/contracts/constants';
// import { BasicNestLogger } from '@formio/server';
// import { ConfigModule } from '@formio/utilities';
// import { CacheModule } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { NestFactory } from '@nestjs/core';
// import { LoggerModule } from 'nestjs-pino';

// import { PackageLicenseService } from '../services';

// /**
//  * This is only part of the script. Use the related shell file to do all the work
//  */
// async function bootstrap() {
//   const app = await NestFactory.createApplicationContext(
//     {
//       imports: [
//         CacheModule.register(),
//         ConfigModule.register<AutomagicalConfig>(APP_DEVTOOLS, {
//           application: {
//             FORMIO_LIBS: [
//               'formio',
//               'formio.js',
//               'angular-formio',
//               'react-formio',
//               'react-native-formio',
//               'vue-formio',
//               'aurelia-formio',
//               'formio-viewer',
//               'formio-cli',
//               'formio-service',
//               'formio-sql',
//               'formio-upload',
//               'formio-webhook-receiver',
//               'formio-workers',
//               'resquel',
//               'keycred',
//               'uswds',
//             ],
//             OUTPUT_PATH: 'apps/devtools/out/license-check/package.json',
//           },
//         }),
//         LoggerModule.forRootAsync({
//           inject: [ConfigService],
//           useFactory(configService: ConfigService) {
//             return {
//               pinoHttp: {
//                 level: configService.get(LOG_LEVEL),
//               },
//             };
//           },
//         }),
//       ],
//       module: class {},
//       providers: [PackageLicenseService],
//     },
//     {
//       logger: BasicNestLogger(),
//     },
//   );
//   const changelogService = app.get(PackageLicenseService);
//   await changelogService.build();
//   await app.close();
// }

// bootstrap();

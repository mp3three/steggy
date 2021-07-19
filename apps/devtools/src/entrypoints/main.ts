import { MainCLIREPL } from '@automagical/terminal';
import { SetTrace, sleep } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { DevtoolsModule } from '../modules';

const noop = () => {
  return;
};
async function bootstrap() {
  SetTrace(false);
  await sleep(1000);
  const app = await NestFactory.createApplicationContext(DevtoolsModule, {
    // logger: {
    //   error: noop,
    //   log: noop,
    //   warn: noop,
    // },
  });
  const mainCLIService = app.get(MainCLIREPL);
  await mainCLIService.main('DevTools');
  await app.close();
}

bootstrap();

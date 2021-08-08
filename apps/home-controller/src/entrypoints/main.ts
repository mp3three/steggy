import { RoomExplorerService } from '@automagical/controller-logic';
import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { HomeControllerModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.create(HomeControllerModule, {
    cors: true,
    logger: AutoLogService.nestLogger(),
  });
  const explorer = app.get(RoomExplorerService);
  explorer.application = app;
  await app.init();

  // const logger = app.get(AutoLogService);
  // const config = app.get(AutoConfigService);
  // app.use(helmet());
  // const limit = config.get(BODY_SIZE);
  // if (limit) {
  //   app.use(json({ limit }));
  // }
  // const port = config.get(PORT);
  // await app.listen(port, () => logger.info(`Listening on ${port}`));
}
AutoLogService.prettyLog();
bootstrap();

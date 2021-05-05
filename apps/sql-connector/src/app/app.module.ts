import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { ConnectorController } from './connector.controller';

@Module({
  controllers: [ConnectorController],
  imports: [],
  providers: [AppService],
})
export class AppModule {}

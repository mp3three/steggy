import { Module } from '@nestjs/common';

import { JiraService } from '../services';

@Module({
  exports: [JiraService],
  providers: [JiraService],
})
export class WrapperModule {}

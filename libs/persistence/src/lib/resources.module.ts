import { Module } from '@nestjs/common';
import { ProjectDriver } from './drivers';

@Module({
  providers: [ProjectDriver],
  exports: [ProjectDriver],
})
export class ResourcesModule {}

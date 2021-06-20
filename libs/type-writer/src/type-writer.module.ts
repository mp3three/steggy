import { Global, Module } from '@nestjs/common';

import { TypeWriterService } from './lib';
import { AnnotationBuilderService } from './lib/annotation-builder.service';
import { DTOBuilderService } from './lib/dto-builder.service';

@Global()
@Module({
  exports: [TypeWriterService],
  providers: [TypeWriterService, DTOBuilderService, AnnotationBuilderService],
})
export class TypeWriterModule {}

import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';
import { ClassConstructor } from 'class-transformer';

export async function Bootstrap(app: ClassConstructor<unknown>): Promise<void> {
  await (
    await NestFactory.create(app, { logger: AutoLogService.nestLogger })
  ).init();
}

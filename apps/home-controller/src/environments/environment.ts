import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';
import { ClassConstructor } from 'class-transformer';

export async function Bootstrap(
  module: ClassConstructor<unknown>,
): Promise<void> {
  await (
    await NestFactory.create(module, {
      logger: AutoLogService.nestLogger,
    })
  ).init();
}

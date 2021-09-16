import {
  AutoLogService,
  BootstrapOptions,
  UsePrettyLogger,
} from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  prettyLog: true,
};
export async function Bootstrap(
  module: ClassConstructor<unknown>,
): Promise<void> {
  if (chalk.supportsColor) {
    UsePrettyLogger();
  }
  await (
    await NestFactory.create(module, {
      logger: AutoLogService.nestLogger,
    })
  ).init();
}

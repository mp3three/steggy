import { AutoLogService, UsePrettyLogger } from '@automagical/utilities';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { eachSeries } from 'async';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';

export interface BootstrapOptions {
  prettyLog?: boolean;
  preInit?: ((app: INestApplication) => Promise<void>)[];
  skipInit?: boolean;
}

/**
 * Standardized init process
 */
export async function Bootstrap(
  module: ClassConstructor<unknown>,
  { prettyLog, skipInit, preInit }: BootstrapOptions,
): Promise<void> {
  if (prettyLog && chalk.supportsColor) {
    UsePrettyLogger();
  }
  const app = await NestFactory.create(module, {
    logger: AutoLogService.nestLogger,
  });
  preInit ??= [];
  await eachSeries(preInit, async (item, callback) => {
    await item(app);
    callback();
  });
  if (!skipInit) {
    await app.init();
  }
}

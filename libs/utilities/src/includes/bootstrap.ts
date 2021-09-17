/* Something about bootstrapping completely breaks things with a normal reference */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {
  AutoLogService,
  NEST_NOOP_LOGGER,
  UsePrettyLogger,
} from '@automagical/utilities';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { eachSeries } from 'async';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';

export interface BootstrapOptions {
  prettyLog?: boolean;
  preInit?: ((app: INestApplication) => Promise<void>)[];
  postInit?: ((app: INestApplication) => Promise<void>)[];
  nestNoopLogger?: boolean;
}

/**
 * Standardized init process
 */
export async function Bootstrap(
  module: ClassConstructor<unknown>,
  { prettyLog, preInit, nestNoopLogger, postInit }: BootstrapOptions,
): Promise<void> {
  if (prettyLog && chalk.supportsColor) {
    UsePrettyLogger();
  }
  const app = await NestFactory.create(module, {
    logger: nestNoopLogger ? NEST_NOOP_LOGGER : AutoLogService.nestLogger,
  });
  preInit ??= [];
  await eachSeries(preInit, async (item, callback) => {
    await item(app);
    callback();
  });
  await app.init();
  postInit ??= [];
  await eachSeries(postInit, async (item, callback) => {
    await item(app);
    callback();
  });
}

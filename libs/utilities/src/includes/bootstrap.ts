/* Something about bootstrapping completely breaks things with a normal reference */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {
  AutoLogService,
  LIB_UTILS,
  LifecycleService,
  NEST_NOOP_LOGGER,
  UsePrettyLogger,
} from '@automagical/utilities';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { eachSeries } from 'async';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';
import { Express } from 'express';
import express from 'express';

export interface BootstrapOptions {
  prettyLog?: boolean;
  preInit?: ((
    app: INestApplication,
    expressServer: Express,
  ) => Promise<void>)[];
  postInit?: ((
    app: INestApplication,
    expressServer: Express,
  ) => Promise<void>)[];
  nestNoopLogger?: boolean;
  http?: boolean;
}

/**
 * Standardized init process
 */
export async function Bootstrap(
  module: ClassConstructor<unknown>,
  { prettyLog, preInit, nestNoopLogger, postInit, http }: BootstrapOptions,
): Promise<void> {
  if (prettyLog && chalk.supportsColor) {
    UsePrettyLogger();
  }
  let server: Express;
  const options = {
    logger: nestNoopLogger ? NEST_NOOP_LOGGER : AutoLogService.nestLogger,
  };
  let app: INestApplication;
  if (http) {
    server = express();
    app = await NestFactory.create(module, new ExpressAdapter(server), options);
  } else {
    app = await NestFactory.create(module, options);
  }
  const lifecycle = app.get(LifecycleService);
  const logger = await app.resolve(AutoLogService);
  logger.setContext(LIB_UTILS, { name: 'Bootstrap' });
  // onPreInit
  preInit ??= [];
  const call = async (item, callback) => {
    await item(app, server);
    callback();
  };
  await eachSeries(preInit, call);
  await lifecycle.preInit(app, server);
  // ...init
  // onModuleCreate
  // onApplicationBootstrap
  await app.init();
  // onPostInit
  postInit ??= [];
  await eachSeries(postInit, call);
  await lifecycle.postInit(app, server);
  logger.info(`🎓 Bootstrap control released! 🎓`);
}

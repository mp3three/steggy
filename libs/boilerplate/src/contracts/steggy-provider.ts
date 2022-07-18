import { INestApplication } from '@nestjs/common';
import { Express } from 'express';

import { BootstrapOptions } from '../includes';

type NO_RESULT = void | Promise<void> | unknown | Promise<unknown>;

/**
 * Helper interface for method discovery
 */
export interface iSteggyProvider {
  /**
   * ### NestJS lifecycle event
   *
   * Called after all `onModuleDestroy()` handlers have completed (Promises resolved or rejected);
   * once complete (Promises resolved or rejected), all existing connections will be closed (`app.close()` called).
   */
  beforeApplicationShutdown?: (signal: string) => NO_RESULT;
  /**
   * ### NestJS lifecycle event
   *
   * Called once all modules have been initialized, but before listening for connections.
   */
  onApplicationBootstrap?: () => NO_RESULT;
  /**
   * Called after connections close (`app.close()` resolves).
   */
  onApplicationShutdown?: (signal: string) => NO_RESULT;
  /**
   * ### NestJS lifecycle event
   *
   * Called after a termination signal (e.g., `SIGTERM`) has been received.
   */
  onModuleDestroy?: () => NO_RESULT;
  /**
   * ### NestJS lifecycle event
   *
   * Called once the host module's dependencies have been resolved.
   */
  onModuleInit?: () => NO_RESULT;
  /**
   * ### Steggy lifecycle event
   *
   * Called after NestJS has finished it's initialization sequence.
   * In most cases, the NestJS lifecycle events (`onModuleInit` / `onApplicationBootstrap`) are more appropriate.
   */
  onPostInit?: (
    application: INestApplication,
    express?: Express,
    options?: BootstrapOptions,
  ) => NO_RESULT;
  /**
   * ### Steggy lifecycle event
   *
   * Called after all providers are created, but before NestJS starts it's initialization.
   * In most cases, the NestJS lifecycle events (`onModuleInit` / `onApplicationBootstrap`) are more appropriate.
   *
   * Can be utilized to run custom logic/analysis against the application, then exit before finishing the bootstrap
   */
  onPreInit?: (
    application: INestApplication,
    express?: Express,
    options?: BootstrapOptions,
  ) => NO_RESULT;
  /**
   * ### Steggy lifecycle event
   *
   * Intended for situations where application flow needs to be changed, and an early exit is performed.
   * Called prior to `onPreInit`, as to not cause race conditions.
   */
  rewire?: (
    application: INestApplication,
    options: BootstrapOptions,
  ) => NO_RESULT;
}

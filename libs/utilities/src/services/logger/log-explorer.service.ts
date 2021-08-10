import { LIB_UTILS } from '@automagical/contracts/constants';
import {
  DEBUG_LOG,
  DebugLogDTO,
  LOG_CONTEXT,
  LOGGER_LIBRARY,
  TRACE_LOG,
  TraceLogDTO,
  WARNING_LOG,
  WarningLogDTO,
} from '@automagical/contracts/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClassConstructor } from 'class-transformer';

import { mappedContexts } from '../../decorators/injectors';
import { getLogContext } from '../../includes/logger';
import { AutoLogService } from './auto-log.service';

/**
 * TODO: Find a way to entirely disable trace / debug logging if the config log level is too low
 *
 * Currently, nodejs crashes if I attempt to inject the config service here
 */
@Injectable()
export class LogExplorerService {
  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onModuleInit(): void {
    const providers = this.discoveryService.getProviders();
    this.mergeLoggerLibraries(providers);
    this.annotationLoggers(providers);
    this.logger.info(`Logger initialized`);
  }

  // #endregion Protected Methods

  // #region Private Methods

  private annotationLoggers(providers: InstanceWrapper[]): void {
    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance) {
        return;
      }
      const proto = Object.getPrototypeOf(instance);
      this.metadataScanner.scanFromPrototype(instance, proto, (key) => {
        // this.traceLog(wrapper, key);
        this.debugLog(wrapper, key);
        this.warnLog(wrapper, key);
      });
    });
  }

  private debugLog(wrapper: InstanceWrapper, key: string): void {
    const { instance } = wrapper;
    const options = this.reflector.get<DebugLogDTO>(DEBUG_LOG, instance[key]);
    if (!options) {
      return;
    }
    const originalMethod = instance[key];
    instance[key] = function (...parameters) {
      const message = options.message ?? `${this.context}#${key}`;
      AutoLogService.call('debug', getLogContext(instance), message);
      return originalMethod.apply(this, parameters);
    };
  }

  private mergeLoggerLibraries(
    providers: InstanceWrapper<ClassConstructor<unknown>>[],
  ): void {
    providers.forEach((wrapper) => {
      const { instance, host } = wrapper;
      if (!instance) {
        return;
      }
      const proto = instance.constructor;
      if (!proto || !proto[LOGGER_LIBRARY]) {
        return;
      }
      const loggerContext: string = proto[LOGGER_LIBRARY];
      host.providers.forEach(({ metatype }) => {
        if (
          !metatype ||
          ['ModuleRef', '', 'useFactory'].includes(metatype.name ?? '') ||
          typeof metatype[LOG_CONTEXT] !== 'undefined'
        ) {
          return;
        }
        const context = `${loggerContext}:${metatype.name}`;
        mappedContexts.forEach((value, key) => {
          if (value === metatype.name) {
            mappedContexts.set(key, context);
          }
        });
        metatype[LOG_CONTEXT] ??= context;
        AutoLogService.call(
          'debug',
          `${LIB_UTILS.description}:${LogExplorerService.name}`,
          `Created log context {${context}}`,
        );
        metatype[LOGGER_LIBRARY] ??= loggerContext;
      });
    });
  }

  private traceLog(wrapper: InstanceWrapper, key: string): void {
    const { instance } = wrapper;
    const options = this.reflector.get<TraceLogDTO>(TRACE_LOG, instance[key]);
    if (!options) {
      return;
    }
    const originalMethod = instance[key];
    instance[key] = function (...parameters) {
      const message = options.message ?? `${this.context}#${key}`;
      AutoLogService.call('trace', getLogContext(instance) + ':PRE', message);
      const result = originalMethod.apply(this, parameters);
      AutoLogService.call('trace', getLogContext(instance) + ':POST', message);
      return result;
    };
  }

  private warnLog(wrapper: InstanceWrapper, key: string): void {
    const { instance } = wrapper;
    const options = this.reflector.get<WarningLogDTO>(
      WARNING_LOG,
      instance[key],
    );
    if (!options) {
      return;
    }
    const originalMethod = instance[key];
    instance[key] = function (...parameters) {
      const message = options.message ?? `${this.context}#${key}`;
      AutoLogService.call('warn', getLogContext(instance) + ':POST', message);
      return originalMethod.apply(this, parameters);
    };
  }

  // #endregion Private Methods
}

import {
  DEBUG_LOG,
  DebugLogDTO,
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
  }

  // #endregion Protected Methods

  // #region Private Methods

  private annotationLoggers(providers: InstanceWrapper[]): void {
    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance) {
        return;
      }
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key) => {
          this.traceLog(wrapper, key);
          this.debugLog(wrapper, key);
          this.warnLog(wrapper, key);
        },
      );
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
      AutoLogService.call(
        'debug',
        `${this.context}${instance.constructor.name}`,
        `${options.message ?? `${this.context}#${key}`}`,
      );
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
      host.providers.forEach(({ metatype }) => {
        if (!metatype) {
          return;
        }
        metatype[LOGGER_LIBRARY] = proto[LOGGER_LIBRARY];
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
      AutoLogService.call(
        'trace',
        `${this.context}${instance.constructor.name}:PRE`,
        `${options.message ?? `${this.context}#${key}`}`,
      );
      const result = originalMethod.apply(this, parameters);
      AutoLogService.call(
        'trace',
        `${this.context}${instance.constructor.name}:POST`,
        `${options.message ?? `${this.context}#${key}`}`,
      );
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
      AutoLogService.call(
        'warn',
        `${this.context}${instance.constructor.name}`,
        `${options.message ?? `${this.context}#${key}`}`,
      );
      return originalMethod.apply(this, parameters);
    };
  }

  // #endregion Private Methods
}

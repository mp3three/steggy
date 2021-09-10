import { LOG_CONTEXT } from '@automagical/contracts/utilities';
import { Injectable, Type } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { EventEmitter2 } from 'eventemitter2';

import { EVENT_LISTENER_METADATA, OnEventMetadata } from '../decorators';
import { Info, Trace } from '../decorators/logger.decorator';
import { AutoLogService } from './logger';

@Injectable()
export class EventsExplorerService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
    private readonly eventEmitter: EventEmitter2,
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  @Trace()
  public getEventHandlerMetadata(
    target: Type<unknown>,
  ): OnEventMetadata | undefined {
    return this.reflector.get(EVENT_LISTENER_METADATA, target);
  }

  @Trace()
  public loadEventListeners(): void {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    [...providers, ...controllers]
      .filter((wrapper) => wrapper.isDependencyTreeStatic())
      .filter((wrapper) => wrapper.instance)
      .forEach((wrapper: InstanceWrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance);
        this.metadataScanner.scanFromPrototype(
          instance,
          prototype,
          (key: string) => {
            this.subscribe(instance, key);
          },
        );
      });
  }

  @Info({ after: `[Events] initialized` })
  protected onApplicationBootstrap(): void {
    this.loadEventListeners();
  }

  @Trace()
  protected onApplicationShutdown(): void {
    this.eventEmitter.removeAllListeners();
  }

  @Trace()
  private subscribe<T extends Record<string, Type>>(instance: T, key: keyof T) {
    const eventListenerMetadata = this.getEventHandlerMetadata(instance[key]);
    if (!eventListenerMetadata) {
      return;
    }
    const { event, options } = eventListenerMetadata;
    const context = instance.constructor[LOG_CONTEXT];
    this.logger.debug(
      `${context}#${key} event subscribe {${JSON.stringify(event)}}`,
    );
    this.eventEmitter.on(
      event,
      (...parameters: unknown[]) => instance[key].call(instance, ...parameters),
      options,
    );
  }
}

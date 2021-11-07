import { Injectable, Type } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { EventEmitter2 } from 'eventemitter2';

import { LOG_CONTEXT } from '../contracts/logger';
import {
  EVENT_LISTENER_METADATA,
  OnEventMetadata,
} from '../decorators/events.decorator';
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

  public getEventHandlerMetadata(
    target: Type<unknown>,
  ): OnEventMetadata | undefined {
    return this.reflector.get(EVENT_LISTENER_METADATA, target);
  }

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

  protected onApplicationBootstrap(): void {
    this.loadEventListeners();
    this.logger.info(`[Events] initialized`);
  }

  protected onApplicationShutdown(): void {
    this.eventEmitter.removeAllListeners();
  }

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

import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClassConstructor } from 'class-transformer';

/* eslint-disable security/detect-object-injection */

@Injectable()
export class LogExplorerService {
  // #region Constructors

  constructor(private readonly discoveryService: DiscoveryService) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onModuleInit(): void {
    const providers: InstanceWrapper<ClassConstructor<unknown>>[] =
      this.discoveryService.getProviders();
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

  // #endregion Protected Methods
}

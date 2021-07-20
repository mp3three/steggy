import { Module, Provider } from '@nestjs/common';

import { LutronPicoService } from '../devices';
import {
  CameraDomainService,
  ClimateDomainService,
  CoverDomainService,
  FanDomainService,
  HomeAssistantCoreService,
  HumidifierDomain,
  iCloudDomainService,
  LightDomainService,
  LockDomainService,
  NotifyDomainService,
  RemoteDomainService,
  SwitchDomainService,
} from '../domains';
import {
  EntityService,
  HACallService,
  HASocketAPIService,
  HomeAssistantFetchAPIService,
} from '../services';

const services: Provider[] = [
  // Devices
  LutronPicoService,
  // Domains
  CameraDomainService,
  ClimateDomainService,
  CoverDomainService,
  FanDomainService,
  HomeAssistantCoreService,
  HumidifierDomain,
  iCloudDomainService,
  LightDomainService,
  LockDomainService,
  NotifyDomainService,
  RemoteDomainService,
  RemoteDomainService,
  SwitchDomainService,
  // Service
  EntityService,
  HACallService,
  HomeAssistantFetchAPIService,
  HASocketAPIService,
];

@Module({
  exports: services,
  providers: services,
})
export class HomeAssistantModule {}

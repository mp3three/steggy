import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { LoggableModule } from '@automagical/utilities';
import { Global, Module, Provider } from '@nestjs/common';

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
  MediaPlayerDomainService,
  NotifyDomainService,
  RemoteDomainService,
  SwitchDomainService,
} from '../domains';
import {
  EntityManagerService,
  HACallService,
  HASocketAPIService,
  HomeAssistantFetchAPIService,
} from '../services';

const services: Provider[] = [
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
  MediaPlayerDomainService,
  NotifyDomainService,
  RemoteDomainService,
  RemoteDomainService,
  SwitchDomainService,
  // Service
  HACallService,
  HomeAssistantFetchAPIService,
  HASocketAPIService,
  EntityManagerService,
];

@Global()
@Module({
  exports: services,
  providers: services,
})
@LoggableModule(LIB_HOME_ASSISTANT)
export class HomeAssistantModule {}

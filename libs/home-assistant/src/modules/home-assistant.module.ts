import { LIB_HOME_ASSISTANT } from '@automagical/contracts';
import { LibraryModule } from '@automagical/utilities';
import { Provider } from '@nestjs/common';

import { CONFIG } from '../config';
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

@LibraryModule({
  config: CONFIG,
  exports: services,
  library: LIB_HOME_ASSISTANT,
  providers: services,
})
export class HomeAssistantModule {}

import { CacheModule, Module, Provider } from '@nestjs/common';

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

const services: Provider[] = [
  LutronPicoService,
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
];

@Module({
  exports: services,
  imports: [CacheModule],
  providers: services,
})
export class HomeAssistantModule {}

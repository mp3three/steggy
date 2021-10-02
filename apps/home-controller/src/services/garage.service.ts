import { TeslaClimateStateDTO } from '@automagical/home-assistant';
import {
  ClimateDomainService,
  EntityManagerService,
  LockDomainService,
  NotifyDomainService,
} from '@automagical/home-assistant';
import { AutoLogService, Debug, OnMQTT } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GarageService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly climateService: ClimateDomainService,
    private readonly lockService: LockDomainService,
    private readonly entityManagerService: EntityManagerService,
    private readonly notifyService: NotifyDomainService,
  ) {}
}

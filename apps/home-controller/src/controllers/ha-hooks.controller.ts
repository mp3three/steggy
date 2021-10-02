import {
  ClimateDomainService,
  EntityManagerService,
  LockDomainService,
  NotifyDomainService,
  TeslaClimateStateDTO,
} from '@automagical/home-assistant';
import { GENERIC_SUCCESS_RESPONSE } from '@automagical/server';
import { Debug } from '@automagical/utilities';
import { Controller, Put } from '@nestjs/common';

import { RelayCommand } from '../decorators';
import { ApplicationService } from '../services';

@Controller('/home-assistant')
export class HAHooksController {
  constructor(
    public readonly applicationService: ApplicationService,
    private readonly climateService: ClimateDomainService,
    private readonly notifyService: NotifyDomainService,
    private readonly entityManager: EntityManagerService,
    private readonly lockService: LockDomainService,
  ) {}

  @Put('/car-ac')
  @Debug('Turning on car AC')
  public async carAc(): Promise<void> {
    await this.climateService.setHvacMode(
      'climate.mystique_hvac_climate_system',
      'heat_cool',
    );
    await this.notifyService.notify('HVAC on sent');
    const state = await this.entityManager.nextState<TeslaClimateStateDTO>(
      'climate.mystique_hvac_climate_system',
    );
    await this.notifyService.notify(`HVAC confirmed ${state.state}`);
  }

  @Put('/car-frunk')
  @Debug('Open Frunk')
  public async carFrunk(): Promise<void> {
    await this.lockService.unlock('lock.mystique_frunk_lock');
  }

  @Put('/leave-home')
  @Debug(`HA: Leave Home`)
  @RelayCommand('*', 'areaOff')
  public async leaveHome(): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.applicationService.lockDoors();
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put('/lock-doors')
  @Debug(`HA: Unlock Doors`)
  public async lockDoors(): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.applicationService.lockDoors();
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put('/unlock-doors')
  @Debug(`HA: Unlock Doors`)
  public async unlockDoors(): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.applicationService.unlockDoors();
    return GENERIC_SUCCESS_RESPONSE;
  }
}

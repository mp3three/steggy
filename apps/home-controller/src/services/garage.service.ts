import { TeslaClimateStateDTO } from '@automagical/contracts/home-assistant';
import {
  ClimateDomainService,
  EntityManagerService,
  LockDomainService,
  NotifyDomainService,
} from '@automagical/home-assistant';
import { Debug, Subscribe } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GarageService {
  // #region Constructors

  constructor(
    private readonly climateService: ClimateDomainService,
    private readonly lockService: LockDomainService,
    private readonly entityManagerService: EntityManagerService,
    private readonly notifyService: NotifyDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Subscribe('mobile/car_ac')
  @Debug('Turning on car AC')
  public async carAc(): Promise<void> {
    await this.climateService.setHvacMode(
      'climate.mystique_hvac_climate_system',
      'heat_cool',
    );
    await this.notifyService.notify('HVAC on sent');
    const state =
      await this.entityManagerService.nextState<TeslaClimateStateDTO>(
        'climate.mystique_hvac_climate_system',
      );
    await this.notifyService.notify(`HVAC confirmed ${state.state}`);
  }

  @Subscribe('mobile/car_frunk')
  @Debug('Turning on car AC')
  public async carFrunk(): Promise<void> {
    await this.lockService.unlock('lock.mystique_frunk_lock');
  }

  // #endregion Public Methods
}

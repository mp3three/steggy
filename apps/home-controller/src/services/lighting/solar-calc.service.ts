import { AutoLogService, OnEvent } from '@automagical/boilerplate';
import { LOCATION_UPDATED } from '@automagical/controller-shared';
import { HASocketAPIService } from '@automagical/home-assistant';
import { HA_SOCKET_READY } from '@automagical/home-assistant-shared';
import { is, sleep } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import EventEmitter from 'eventemitter3';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';

const CALC_EXPIRE = 30_000;

@Injectable()
export class SolarCalcService {
  constructor(
    private readonly socketService: HASocketAPIService,
    private readonly eventEmitter: EventEmitter,
    private readonly logger: AutoLogService,
  ) {}

  public latitude: number;
  public longitude: number;
  private CALCULATOR;

  public get SOLAR_CALC(): SolarCalcType {
    if (this.CALCULATOR) {
      return this.CALCULATOR;
    }
    setTimeout(() => (this.CALCULATOR = undefined), CALC_EXPIRE);
    // @ts-expect-error Typescript is wrong this time, this works as expected
    return new SolarCalc(new Date(), this.latitude, this.longitude);
  }

  public async getCalc(): Promise<SolarCalcType> {
    if (!is.number(this.latitude)) {
      this.logger.debug(`Waiting for {lat}/{long}`);
      await sleep();
      return await this.getCalc();
    }
    return this.SOLAR_CALC;
  }

  @OnEvent(HA_SOCKET_READY)
  protected async updateConfig(): Promise<void> {
    const config = await this.socketService.getConfig();
    this.latitude = config.latitude;
    this.longitude = config.longitude;
    this.logger.debug(
      // {
      //   latitude: config.latitude,
      //   longitude: config.longitude,
      // },
      `Updated location`,
    );
    this.eventEmitter.emit(LOCATION_UPDATED);
  }
}

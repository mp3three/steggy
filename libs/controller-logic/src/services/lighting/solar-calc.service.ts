import { HA_SOCKET_READY, HASocketAPIService } from '@for-science/home-assistant';
import { AutoLogService, OnEvent, sleep } from '@for-science/utilities';
import { Injectable } from '@nestjs/common';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';

const CALC_EXPIRE = 30_000;

@Injectable()
export class SolarCalcService {
  constructor(
    private readonly socketService: HASocketAPIService,
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
    if (typeof this.latitude !== 'number') {
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
  }
}

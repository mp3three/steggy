import { SolarActivateDTO } from '@automagical/controller-logic';
import { ICONS, PromptEntry, PromptService } from '@automagical/tty';
import { DOWN, TitleCase, UP } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';
import SolarCalc from 'solar-calc';
import SolarCalcType from 'solar-calc/types/solarCalc';

import { HomeFetchService } from '../../home-fetch.service';

const KEYS = [
  'solarNoon',
  'sunrise',
  'sunset',
  'sunriseEnd',
  'sunsetStart',
  'civilDawn',
  'dawn',
  'civilDusk',
  'dusk',
  'nauticalDawn',
  'nauticalDusk',
  'nightStart',
  'astronomicalDusk',
  'astronomicalDawn',
  'nightEnd',
  'goldenHourStart',
  'goldenHourEnd',
] as (keyof SolarCalcType)[];

@Injectable()
export class SolarBuilderService {
  constructor(
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async build(
    current: Partial<SolarActivateDTO> = {},
  ): Promise<SolarActivateDTO> {
    const location = await this.fetchService.fetch<
      Record<'latitude' | 'longitude', number>
    >({
      url: `/debug/location`,
    });
    const d = dayjs().format('YYYY-MM-DD 00:00:00');
    // @ts-expect-error Typescript is wrong this time, this works as expected
    const calc = new SolarCalc(
      new Date(d),
      location.latitude,
      location.longitude,
    );
    console.log(chalk.yellow` ${ICONS.WARNING} Times vary based on date`);
    const event = await this.promptService.pickOne(
      `Event`,
      KEYS.map((key) => [
        chalk`{gray.bold ${dayjs(calc[key]).format('HH:mm:ss')}} ${TitleCase(
          key,
          false,
        )}`,
        key,
      ]).sort(([a], [b]) => (a > b ? UP : DOWN)) as PromptEntry<
        keyof SolarCalcType
      >[],
      current.event,
    );
    return { event };
  }

  public async createSchedule(current: string): Promise<string> {
    const schedule = await this.promptService.string(`Cron schedule`, current);
    // TODO: validate schedule
    return schedule;
  }
}

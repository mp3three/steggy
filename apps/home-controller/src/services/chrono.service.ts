import { AutoLogService } from '@steggy/boilerplate';
import { Injectable } from '@nestjs/common';
import { casual, Chrono } from 'chrono-node';

import { SolarCalcService } from './lighting';

// const SOLAR_INJECT = [
//   'astronomicalDawn',
//   'astronomicalDusk',
//   'civilDawn',
//   'civilDusk',
//   'dawn',
//   'dusk',
//   'nauticalDawn',
//   'nauticalDusk',
//   'nightEnd',
//   'nightStart',
//   'solarNoon',
//   'sunrise',
//   'sunriseEnd',
//   'sunset',
//   'sunsetStart',
// ];

@Injectable()
export class ChronoService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly solarCalc: SolarCalcService,
  ) {}

  private parser: Chrono;

  public parse<T = unknown>(
    expression: string,
    defaultValue?: T,
  ): [Date | T] | [Date, Date] {
    const [parsed] = this.parser.parse(expression);
    if (!parsed) {
      this.logger.error({ expression }, `Expression failed parsing`);
      // 🤷
      return [(defaultValue ?? new Date()) as T];
    }
    if (parsed.end) {
      return [parsed.start.date(), parsed.end.date()];
    }
    return [parsed.start.date()];
  }

  protected onModuleInit(): void {
    // Getting results that are different from expecations
    //
    //
    this.parser = casual.clone();
    // SOLAR_INJECT.forEach(key =>
    //   this.parser.parsers.push({
    //     extract: context => {
    //       // const now = new Date();
    //       const calc = this.solarCalc.getCalcSync(context.refDate);
    //       const date = calc[key] as Date;
    //       return {
    //         refDate: date,
    //       };
    //       // console.log(key, date, context.refDate, now);
    //       // return {
    //       //   day: date.getDay(),
    //       //   hour: date.getHours(),
    //       //   millisecond: date.getMilliseconds(),
    //       //   minute: date.getMinutes(),
    //       //   month: date.getMonth(),
    //       //   second: date.getSeconds(),
    //       //   year: date.getFullYear(),
    //       // };
    //     },
    //     pattern: () => new RegExp(key, 'i'),
    //   }),
    // );
    // setTimeout(() => {
    //   const [sunset] = this.parse<Date>('sunset');
    //   this.logger.error({
    //     now: new Date().toLocaleString(),
    //     sunset: sunset.toLocaleString(),
    //   });
    // }, 5000);
  }
}

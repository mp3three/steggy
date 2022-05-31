import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { casual, Chrono } from 'chrono-node';

import { SolarCalcService } from '../lighting';

const SOLAR_INJECT = [
  // 'astronomicalDawn',
  // 'astronomicalDusk',
  // 'civilDawn',
  // 'civilDusk',
  'dawn',
  'dusk',
  // 'nauticalDawn',
  // 'nauticalDusk',
  // 'nightEnd',
  // 'nightStart',
  // 'solarNoon',
  'sunrise',
  // 'sunriseEnd',
  'sunset',
  // 'sunsetStart',
];

@Injectable()
export class ChronoService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => SolarCalcService))
    private readonly solarCalc: SolarCalcService,
  ) {}

  private parser: Chrono;

  public parse<T = unknown>(
    expression: string,
    defaultValue?: T,
  ): [Date | T] | [Date, Date] {
    const [parsed] = this.parser.parse(expression, new Date());
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
    this.parser = casual.clone();
    SOLAR_INJECT.forEach(type => {
      this.parser.parsers.push({
        extract: context => {
          const calc = this.solarCalc.getCalcSync(context.refDate);
          const time = calc[type] as Date;
          return {
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: time.getSeconds(),
          };
        },
        pattern: () => new RegExp(type, 'i'),
      });
    });
  }
}

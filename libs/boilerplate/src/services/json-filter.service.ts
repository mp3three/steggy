import { Injectable } from '@nestjs/common';
import {
  DOWN,
  FILTER_OPERATIONS,
  FilterDTO,
  FIRST,
  is,
  ResultControlDTO,
  SAME,
  START,
  UP,
} from '@steggy/utilities';
import { parseDate } from 'chrono-node';
import { isNumberString } from 'class-validator';
import dayjs from 'dayjs';
import { get } from 'object-path';

import { AutoLogService } from './auto-log.service';

type RelativeCompare = number | Date | dayjs.Dayjs;

/**
 * Quick and dirty matching logic that is compatible with ResultControl
 */
@Injectable()
export class JSONFilterService {
  constructor(private readonly logger: AutoLogService) {}

  public match(item: Record<string, unknown>, filter: FilterDTO): boolean {
    const value = get(item, filter.field);
    if (is.boolean(filter.exists)) {
      const exists = is.undefined(value);
      return (exists && filter.exists) || (!filter.exists && !exists);
    }
    switch (filter.operation) {
      case FILTER_OPERATIONS.gt:
        return this.gt(value, filter.value as RelativeCompare);
      case FILTER_OPERATIONS.gte:
        return this.gte(value, filter.value as RelativeCompare);
      case FILTER_OPERATIONS.lt:
        return this.lt(value, filter.value as RelativeCompare);
      case FILTER_OPERATIONS.lte:
        return this.lte(value, filter.value as RelativeCompare);
      case FILTER_OPERATIONS.ne:
        return !this.eq(value, filter.value);
      case FILTER_OPERATIONS.in:
        if (!Array.isArray(filter.value)) {
          this.logger.warn({ filter }, `value is not an array`);
          return false;
        }
        return filter.value.some(cmp => this.eq(cmp, value));
      case FILTER_OPERATIONS.nin:
        if (!Array.isArray(filter.value)) {
          this.logger.warn({ filter }, `value is not an array`);
          return false;
        }
        return !filter.value.some(cmp => this.eq(cmp, value));
      case FILTER_OPERATIONS.regex:
        return this.regex(value, filter.value as string | RegExp);
      case FILTER_OPERATIONS.elem:
        if (!Array.isArray(value)) {
          this.logger.warn(
            { filter, value },
            `Cannot use elem match on non-array values`,
          );
          return false;
        }
        return value.some(cmp => this.eq(cmp, filter.value));
      // eq = default
      // case FILTER_OPERATIONS.eq:
      default:
        return this.eq(value, filter.value);
    }
  }

  public query<T extends unknown>(control: ResultControlDTO, data: T[]): T[] {
    const filters = control.filters ? [...control.filters.values()] : [];
    data = data.filter(item =>
      filters.every(filter =>
        this.match(item as Record<string, unknown>, filter),
      ),
    );
    data = this.limit(control, data);
    if (is.empty(control.sort)) {
      return data;
    }
    return this.sort(control.sort, data);
  }

  private eq(value: unknown, cmp: unknown): boolean {
    if (is.number(value)) {
      return Number(cmp) === value;
    }
    if (is.string(value)) {
      return String(cmp) === value;
    }
    if (is.boolean(value)) {
      if (is.string(cmp)) {
        if (value) {
          return ['y', 'true'].includes(cmp.toLowerCase());
        }
        return ['n', 'false'].includes(cmp.toLowerCase());
      }
      return false;
    }
    return value === cmp;
  }

  private gt(value: RelativeCompare, cmp: RelativeCompare): boolean {
    value = this.toNumber(value);
    cmp = this.toNumber(cmp);
    return value > cmp;
  }

  private gte(value: RelativeCompare, cmp: RelativeCompare): boolean {
    value = this.toNumber(value);
    cmp = this.toNumber(cmp);
    return value >= cmp;
  }

  private limit<T = unknown>(control: ResultControlDTO, data: T[]): T[] {
    if (is.undefined(control.skip) && is.undefined(control.limit)) {
      return data;
    }
    control.skip ??= 0;
    return data.slice(control.skip, control.skip + control.limit);
  }

  private lt(value: RelativeCompare, cmp: RelativeCompare): boolean {
    value = this.toNumber(value);
    cmp = this.toNumber(cmp);
    return value < cmp;
  }

  private lte(value: RelativeCompare, cmp: RelativeCompare): boolean {
    value = this.toNumber(value);
    cmp = this.toNumber(cmp);
    return value <= cmp;
  }

  private regex(value: string, cmp: string | RegExp): boolean {
    if (is.string(cmp) && cmp.charAt(START) === '/') {
      const [, regex, flags] = cmp.split('/');
      cmp = new RegExp(regex, flags);
    }
    const regex = is.string(cmp) ? new RegExp(cmp, 'gi') : cmp;
    if (!(regex instanceof RegExp)) {
      this.logger.warn({ cmp }, `Bad regex filter`);
      return false;
    }
    return regex.test(value);
  }

  private sort<T = unknown>(fields: string[], data: T[]): T[] {
    const sort = fields.map(item => {
      if (item.charAt(START) === '+') {
        return [true, item.slice(FIRST)];
      }
      if (item.charAt(START) === '-') {
        return [false, item.slice(FIRST)];
      }
      return [false, item];
    }) as [boolean, string][];
    return data.sort((a, b) => {
      for (let i = START; i < sort.length; i++) {
        const [direction, property] = sort[i];
        const fieldA = get(a as Record<string, unknown>, property);
        const fieldB = get(b as Record<string, unknown>, property);
        if (fieldA !== fieldB) {
          if (direction) {
            return fieldA > fieldB ? UP : DOWN;
          }
          return fieldB > fieldA ? UP : DOWN;
        }
      }
      return SAME;
    });
  }

  private toNumber(value: RelativeCompare): number {
    if (is.number(value)) {
      return value;
    }
    if (is.undefined(value)) {
      return Number.NaN;
    }
    if (is.string(value)) {
      if (isNumberString(value)) {
        return Number(value);
      }
      // Best guess attempt to resolve parse a date object out of this string
      // https://github.com/wanasit/chrono
      // Might need to break this part of the logic out if it gets more complex tho
      value = parseDate(value);
    }
    if (value instanceof Date) {
      return value.getTime();
    }
    if (value instanceof dayjs.Dayjs) {
      return value.toDate().getTime();
    }
    this.logger.warn(
      { value },
      `Unknown value type/format, attempting to coerce to number`,
    );
    return Number(value);
  }
}

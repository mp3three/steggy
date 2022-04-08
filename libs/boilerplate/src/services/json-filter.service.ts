import { Injectable } from '@nestjs/common';
import {
  FILTER_OPERATIONS,
  FilterDTO,
  is,
  ResultControlDTO,
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
        return value !== filter.value;
      case FILTER_OPERATIONS.in:
        if (!Array.isArray(filter.value)) {
          this.logger.warn({ filter }, `value is not an array`);
          return false;
        }
        return filter.value.includes(value);
      case FILTER_OPERATIONS.nin:
        if (!Array.isArray(filter.value)) {
          this.logger.warn({ filter }, `value is not an array`);
          return false;
        }
        return !filter.value.includes(value);
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
        return value.includes(filter.value);
      case FILTER_OPERATIONS.eq:
      default:
        return value === filter.value;
    }
  }

  public query<T = Record<string, unknown>>(
    control: Pick<ResultControlDTO, 'filters' | 'limit' | 'skip'>,
    data: T[],
  ): T[] {
    const filters = control.filters ? [...control.filters.values()] : [];
    data = data.filter(item =>
      filters.every(filter =>
        this.match(item as Record<string, unknown>, filter),
      ),
    );
    return data.slice(control.skip, control.limit);
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
    // TODO: Support regex like "/regex/flags"
    const regex = is.string(cmp) ? new RegExp(cmp, 'gi') : cmp;
    if (!(regex instanceof RegExp)) {
      this.logger.warn({ cmp }, `Bad regex filter`);
      return false;
    }
    return regex.test(value);
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

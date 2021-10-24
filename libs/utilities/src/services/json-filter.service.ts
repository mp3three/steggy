/* eslint-disable security/detect-non-literal-regexp
 */
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { get } from 'object-path';

import { FILTER_OPERATIONS, FilterDTO, ResultControlDTO } from '../contracts';
import { Trace } from '../decorators/logger.decorator';
import { AutoLogService } from './logger';

type RelativeCompare = number | Date | dayjs.Dayjs;

/**
 * Quick and dirty matching logic that is compatible with ResultControl
 */
@Injectable()
export class JSONFilterService {
  constructor(private readonly logger: AutoLogService) {}

  @Trace()
  public match(item: Record<string, unknown>, filter: FilterDTO): boolean {
    const value = get(item, filter.field);
    if (typeof filter.exists === 'boolean') {
      const exists = typeof value === 'undefined';
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

  @Trace()
  public query<T = Record<string, unknown>>(
    control: Pick<ResultControlDTO, 'filters' | 'limit' | 'skip'>,
    data: T[],
  ): T[] {
    const filters = control.filters ? [...control.filters.values()] : [];
    data = data.filter((item) =>
      filters.every((filter) =>
        this.match(item as Record<string, unknown>, filter),
      ),
    );
    return data.slice(control.skip, control.limit);
  }

  @Trace()
  private gt(value: RelativeCompare, cmp: RelativeCompare): boolean {
    value = this.toNumber(value);
    cmp = this.toNumber(cmp);
    return value > cmp;
  }

  @Trace()
  private gte(value: RelativeCompare, cmp: RelativeCompare): boolean {
    value = this.toNumber(value);
    cmp = this.toNumber(cmp);
    return value >= cmp;
  }

  @Trace()
  private lt(value: RelativeCompare, cmp: RelativeCompare): boolean {
    value = this.toNumber(value);
    cmp = this.toNumber(cmp);
    return value < cmp;
  }

  @Trace()
  private lte(value: RelativeCompare, cmp: RelativeCompare): boolean {
    value = this.toNumber(value);
    cmp = this.toNumber(cmp);
    return value <= cmp;
  }

  @Trace()
  private regex(value: string, cmp: string | RegExp): boolean {
    const regex = typeof cmp === 'string' ? new RegExp(cmp, 'gi') : cmp;
    if (!(regex instanceof RegExp)) {
      this.logger.warn({ cmp }, `Bad regex filter`);
      return false;
    }
    return regex.test(value);
  }

  @Trace()
  private toNumber(value: RelativeCompare): number {
    if (value instanceof Date) {
      return value.getTime();
    }
    if (value instanceof dayjs.Dayjs) {
      return value.toDate().getTime();
    }
    return Number(value);
  }
}

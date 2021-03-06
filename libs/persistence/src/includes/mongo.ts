/* eslint-disable @typescript-eslint/no-magic-numbers */

import { BadRequestException } from '@nestjs/common';
import {
  FILTER_OPERATIONS,
  FilterDTO,
  FilterValueType,
  INCREMENT,
  is,
  ResultControlDTO,
  SINGLE,
  START,
} from '@steggy/utilities';
import { isNumberString } from 'class-validator';
import dayjs from 'dayjs';

export function filtersToMongoQuery(
  query: ResultControlDTO,
): Map<string, unknown> {
  const out = new Map<string, unknown>();

  (query.filters ?? new Set()).forEach(filter => {
    resolve(filter);
    switch (filter.operation) {
      case 'exists':
        return out.set(filter.field, {
          $exists: ['true', '1'].includes(filter.value.toString()),
        });
      case 'empty':
        return out.set(filter.field, {
          [filter.value ? `$nin` : '$in']: [[], '', null, undefined],
        });
      case 'regex':
        if (filter.value instanceof RegExp) {
          return out.set(filter.field, {
            $regex: filter.value,
          });
        }
        const regexParts = (filter.value as string).split('/');
        if (regexParts.length === SINGLE) {
          return out.set(filter.field, {
            $options: 'i',
            $regex: regexParts[START],
          });
        }
        regexParts.shift();
        return out.set(filter.field, {
          $options: regexParts[INCREMENT],
          $regex: regexParts[START],
        });
      case 'elem':
        return out.set(filter.field, {
          $elemMatch: filter.value,
        });
      case 'in':
      case 'nin':
        const value: FilterValueType[] = Array.isArray(filter.value)
          ? filter.value
          : filter.value.toString().split(',');
        return out.set(filter.field, {
          [`$${filter.operation}`]: value.map(v => cast(filter.field, v)),
        });
      case 'gte':
      case 'lte':
      case 'gt':
      case 'lt':
      case 'eq':
      case 'ne':
        return out.set(filter.field, {
          [`$${filter.operation}`]: cast(filter.field, filter.value),
        });
      default:
        throw new BadRequestException(`Unknown operator: ${filter.operation}`);
    }
  });
  return out;
}

function cast(field: string, value) {
  switch (field) {
    case 'created':
    case 'updated':
      return dayjs(value).toDate();
  }
  return value;
}
/**
 * - default the operation to equals
 * - if numeric, change to in, array with string & number form
 *   - if 1 or 0, add in bool
 * - if 'y', 'n', 'true', 'false' add in bool
 */
function resolve(filter: FilterDTO) {
  filter.operation ??= FILTER_OPERATIONS.eq;
  if (filter.operation === 'exists') {
    return;
  }
  if (isNumberString(filter.value)) {
    const value = Number(filter.value);
    const values = [filter.value as string, value] as FilterValueType[];
    filter.operation = FILTER_OPERATIONS.in;
    if (value === 0) {
      values.push(false);
    }
    if (value === 1) {
      values.push(true);
    }
    filter.value = values;
  } else if (
    is.string(filter.value) &&
    ['y', 'true'].includes(filter.value.toLocaleLowerCase())
  ) {
    filter.value = [filter.value as string, true];
    filter.operation = FILTER_OPERATIONS.in;
  } else if (
    is.string(filter.value) &&
    ['n', 'false'].includes(filter.value.toLowerCase())
  ) {
    filter.operation = FILTER_OPERATIONS.in;
    filter.value = [filter.value as string, false];
  } else if (filter.value === 'null') {
    filter.operation = FILTER_OPERATIONS.in;
    filter.value = [filter.value as string, null];
  }
}

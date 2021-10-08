/* eslint-disable @typescript-eslint/no-magic-numbers */

import { FILTER_OPERATIONS, ResultControlDTO } from '@automagical/utilities';
import { Document, Query, Types } from 'mongoose';

import { filtersToMongoQuery } from '../includes';

export class BaseMongoService {
  protected merge(
    query: ResultControlDTO | string,
    merge: ResultControlDTO = {},
  ): Record<string, unknown> {
    if (typeof query === 'string') {
      merge.filters ??= new Set();
      merge.filters.add({
        field: '_id',
        operation: FILTER_OPERATIONS.in,
        value: [Types.ObjectId(query), query],
      });
      query = merge;
    }
    query ??= {};
    query.filters ??= new Set();

    query.filters.add({
      field: 'deleted',
      value: null,
    });
    return Object.fromEntries(filtersToMongoQuery(query).entries());
  }

  protected modifyQuery<T, J extends Document<unknown> = Document<unknown>>(
    control: ResultControlDTO = {},
    query: Query<T, J>,
  ): Query<T, J> {
    if (control.limit) {
      query = query.limit(control.limit);
    }
    if (control.skip) {
      query = query.skip(control.skip);
    }
    if (control.sort) {
      query = query.sort(control.sort.join(' '));
    }
    if (control.select) {
      const map = new Map<string, number>();
      control.select.forEach((field) => {
        map.set(field, 1);
      });
      query = query.select(Object.fromEntries(map.entries()));
    }
    return query;
  }
}

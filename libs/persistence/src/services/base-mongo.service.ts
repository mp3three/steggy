import { FILTER_OPERATIONS, is, ResultControlDTO } from '@steggy/utilities';
import { Document, Model, Query, Types } from 'mongoose';

import { filtersToMongoQuery } from '../includes';
import { BaseSchemaDTO } from '../schemas';

const SELECTED = 1;

export class BaseMongoService {
  protected model: Model<unknown>;

  /**
   * Like create, but less thinking. Intended for non-standard flows
   */
  public async restore<T extends BaseSchemaDTO>(item: T): Promise<T> {
    return (await this.model.create(item)).toObject();
  }

  public async truncate(): Promise<void> {
    await this.model.deleteMany();
  }

  protected merge(
    query: ResultControlDTO | string,
    merge: ResultControlDTO = {},
  ): Record<string, unknown> {
    if (is.string(query)) {
      merge.filters ??= new Set();
      merge.filters.add({
        field: '_id',
        operation: FILTER_OPERATIONS.in,
        value: [new Types.ObjectId(query), query],
      });
      query = merge;
    }
    query ??= {};
    query.filters ??= new Set();

    let hasDeleted = false;
    query.filters.forEach(i => (hasDeleted ||= i.field === 'deleted'));
    if (!hasDeleted) {
      query.filters.add({
        field: 'deleted',
        value: null,
      });
    }
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
      control.select.forEach(field => map.set(field, SELECTED));
      query = query.select(Object.fromEntries(map.entries()));
    }
    return query;
  }
}

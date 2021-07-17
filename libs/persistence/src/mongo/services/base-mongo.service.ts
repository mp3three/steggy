import { FILTER_OPERATIONS, ResultControlDTO } from '@automagical/contracts/fetch';
import { FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';
import { Document, Query, Types } from 'mongoose';

import { MongooseConnection } from '../classes';

export class BaseMongoService {
  // #region Protected Methods

  protected merge(
    query: ResultControlDTO | string,
    project?: ProjectDTO | string,
    form?: FormDTO | string,
    merge?: ResultControlDTO,
  ): Record<string, unknown> {
    if (typeof query === 'string') {
      merge ??= {};
      merge.filters ??= new Set();
      merge.filters.add({
        field: '_id',
        value: Types.ObjectId(query),
      });
      query = merge;
    }
    query ??= {};
    query.filters ??= new Set();
    if (form) {
      form = typeof form === 'string' ? form : form._id;
      query.filters.add({
        field: 'form',
        operation: FILTER_OPERATIONS.in,
        value: [Types.ObjectId(form), form],
      });
    }
    if (project) {
      project = typeof project === 'string' ? project : project._id;
      query.filters.add({
        field: 'project',
        operation: FILTER_OPERATIONS.in,
        value: [Types.ObjectId(project), project],
      });
    }
    query.filters.add({
      field: 'deleted',
      value: null,
    });
    return Object.fromEntries(
      MongooseConnection.filtersToMongoQuery(query).entries(),
    );
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

  // #endregion Protected Methods
}
// if (query.limit) {
//   out.set('limit', query.limit);
// }
// if (query.skip) {
//   out.set('skip', query.skip);
// }
// if (query.select) {
//   const select = new Map<string, number>();
//   query.select.forEach((item) => {
//     item = item.trim();
//     const value = item.charAt(0) === '-' ? -1 : 1;
//     select.set(value === -1 ? item.slice(1) : item, value);
//   });
//   out.set('projection', Object.fromEntries(select.entries()));
// }
// if (query.sort) {
//   const sort = new Map<string, number>();
//   query.sort.forEach((item) => {
//     item = item.trim();
//     const value = item.charAt(0) === '-' ? -1 : 1;
//     sort.set(value === -1 ? item.slice(1) : item, value);
//   });
//   out.set('sort', sort);
// }

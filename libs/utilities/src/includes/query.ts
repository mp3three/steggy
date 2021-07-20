import {
  FILTER_OPERATIONS,
  ResultControlDTO,
} from '@automagical/contracts/utilities';

export function controlToQuery(
  value: Readonly<ResultControlDTO>,
): Record<string, string> {
  const out = new Map<string, string>();
  if (value.limit) {
    out.set('limit', value.limit.toString());
  }
  if (value.skip) {
    out.set('skip', value.skip.toString());
  }
  if (value.sort) {
    out.set('sort', value.sort.join(','));
  }
  if (value.select) {
    out.set('select', value.select.join(','));
  }
  value?.filters?.forEach((f) => {
    let field = f.field;
    if (f.operation && f.operation !== FILTER_OPERATIONS.eq) {
      field = `${field}__${f.operation}`;
    }
    let value = f.value;
    if (Array.isArray(value)) {
      value = value.join(',');
    }
    if (value instanceof Date) {
      value = value.toISOString();
    }
    out.set(field, value.toString());
  });
  return Object.fromEntries(out.entries());
}

export function queryToControl(
  value: Readonly<Record<string, string>>,
): ResultControlDTO {
  const out: ResultControlDTO = {
    filters: new Set(),
  };
  const parameters = new Map<string, string>(Object.entries(value));
  parameters.forEach((value, key) => {
    const [name, operation] = key.split('__') as [string, FILTER_OPERATIONS];
    switch (key) {
      case 'select':
        out.select = value.split(',');
        return;
      case 'sort':
        out.sort = value.split(',');
        return;
      case 'limit':
        out.limit = Number(value);
        return;
      case 'skip':
        out.skip = Number(value);
        return;
    }
    switch (operation) {
      case 'in':
      case 'nin':
        return out.filters.add({
          field: name,
          operation,
          value: value.split(','),
        });
      case 'elem':
        return out.filters.add({
          field: name,
          operation,
          value: JSON.parse(value),
        });
      default:
        return out.filters.add({
          field: name,
          operation,
          value,
        });
    }
  });
  return out;
}

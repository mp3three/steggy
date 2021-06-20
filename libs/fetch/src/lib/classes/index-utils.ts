import dayjs from 'dayjs';

const IGNORE_LIST = new Set(['limit', 'skip', 'select', 'sort', 'populate']);

const cast = (field: string, value) => {
  switch (field) {
    case 'created':
    case 'updated':
      return dayjs(value).toDate();
  }
  return value;
};

/* eslint-disable security/detect-non-literal-regexp, unicorn/no-null */
export const indexQuery = (
  query: Map<string, string>,
): Map<string, unknown> => {
  const out = new Map<string, unknown>();
  query.forEach((value, key) => {
    if (IGNORE_LIST.has(key)) {
      return;
    }
    const [name, selector] = key.split('__');
    let temporary;
    switch (selector) {
      case 'regex':
        temporary = value.match(new RegExp('(?:/([^/]+))', 'gm'));
        try {
          out.set(name, {
            $options: temporary[2] || 'i',
            $regex: new RegExp(temporary[1]),
          });
        } catch {
          out.set(name, {
            $options: temporary[2] || 'i',
            $regex: null,
          });
        }
        break;
      case 'exists':
        temporary = out.get(name) || {};
        temporary[`$${selector}`] = ['true', '1'].includes(value);
        out.set(name, temporary);
        break;
      case 'in':
      case 'nin':
        temporary = out.get(name) || {};
        temporary[`$${selector}`] = value
          .split(',')
          .map((v) => cast(selector, v));
        out.set(name, temporary);
        break;
      default:
        temporary = out.get(name) || {};
        temporary[`$${selector}`] = cast(selector, value);
        out.set(name, temporary);
    }
  });
  return out;
};
/* eslint-enable security/detect-non-literal-regexp, unicorn/no-null */

export const indexOptions = (
  query: Map<string, string>,
  options: Map<string, unknown> = new Map(),
): Map<string, unknown> => {
  query.forEach((value, key) => {
    switch (key) {
      case 'limit':
      case 'skip':
        options.set(key, Number.parseInt(value, 10));
        break;
      case 'sort':
      case 'select':
        // Select has changed to projection.
        const temporary = new Map<string, number>();
        value.split(',').forEach((item) => {
          item = item.trim();
          const value = item.charAt(0) === '-' ? -1 : 1;
          temporary.set(value === -1 ? item.slice(1) : item, value);
        });
        options.set(key === 'select' ? 'projection' : key, temporary);
        break;
    }
  });
  return options;
};

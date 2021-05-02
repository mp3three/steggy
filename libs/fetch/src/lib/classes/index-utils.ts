import dayjs from 'dayjs';

const IGNORE_LIST = ['limit', 'skip', 'select', 'sort', 'populate'];

const cast = (field: string, value) => {
  switch (field) {
    case 'created':
    case 'updated':
      return dayjs(value).toDate();
  }
  return value;
};

export const indexQuery = (
  query: Map<string, string>,
): Map<string, unknown> => {
  const out = new Map<string, unknown>();
  query.forEach((value, key) => {
    if (IGNORE_LIST.includes(key)) {
      return;
    }
    const [name, selector] = key.split('__');
    let tmp;
    switch (selector) {
      case 'regex':
        tmp = value.match(new RegExp('(?:/([^/]+))', 'gm'));
        try {
          out.set(name, {
            // eslint-disable-next-line security/detect-non-literal-regexp
            $regex: new RegExp(tmp[1]),
            $options: tmp[2] || 'i',
          });
        } catch (err) {
          out.set(name, {
            $regex: null,
            $options: tmp[2] || 'i',
          });
        }
        break;
      case 'exists':
        tmp = out.get(name) || {};
        tmp[`$${selector}`] = ['true', '1'].includes(value);
        out.set(name, tmp);
        break;
      case 'in':
      case 'nin':
        tmp = out.get(name) || {};
        tmp[`$${selector}`] = value.split(',').map((v) => cast(selector, v));
        out.set(name, tmp);
        break;
      default:
        tmp = out.get(name) || {};
        tmp[`$${selector}`] = cast(selector, value);
        out.set(name, tmp);
    }
    return;
  });
  return out;
};

export const indexOptions = (
  query: Map<string, string>,
  options: Map<string, unknown> = new Map(),
): Map<string, unknown> => {
  query.forEach((value, key) => {
    switch (key) {
      case 'limit':
      case 'skip':
        options.set(key, parseInt(value, 10));
        break;
      case 'sort':
      case 'select':
        // Select has changed to projection.
        options.set(
          key === 'select' ? 'projection' : key,
          Object.fromEntries(
            value
              .split(',')
              .map((item) => item.trim())
              .reduce((map, item) => {
                const value = item.charAt(0) === '-' ? -1 : 1;
                map.set(value === -1 ? item.substring(1) : item, value);
                return map;
              }, new Map<string, number>())
              .entries(),
          ),
        );
        break;
    }
    return;
  });
  return options;
};

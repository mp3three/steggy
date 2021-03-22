import debugLib from 'debug';
import { iLogger } from '../typings/iLogger';

// Color tables
// See: image at "88/256 colors" / "foreground (text)"
const LogLevels = {
  // Acid green
  emerg: '112',
  // Orange
  alert: '166',
  // Tan
  crit: '150',
  // Red
  error: '1',
  // Yellow
  warning: '3',
  // Green
  notice: '2',
  // Blue
  info: '4',
  // White
  debug: '7',
};

export const LoggerRegistry = {};

/**
 * @see Loggers
 */
export const Logger = (
  prefix: string | { name: string },
  filters = {},
): iLogger => {
  prefix = typeof prefix === 'string' ? prefix : prefix.name;
  const out: Partial<iLogger> = {};
  prefix = (process.env.LOG_PREFIX || 'automagical') + ':' + prefix;
  Object.keys(LogLevels).forEach((level) => {
    out[level] = debugLib(`${prefix}:${level}`);
    out[level].color = LogLevels[level].toString();
  });

  Object.keys(out).forEach((key) => {
    const fn = out[key];
    out[key] = (...args) => {
      if (filters[key]) {
        if (!filters[key](...args)) {
          return;
        }
      }
      fn(...args);
    };
  });
  LoggerRegistry[prefix] = out;
  return out as iLogger;
};

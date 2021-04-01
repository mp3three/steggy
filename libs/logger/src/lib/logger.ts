// import debugLib from 'debug';
import { iLogger } from '../typings/iLogger';
import * as winston from 'winston';

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

export const Registry = {};

/**
 * | Value | Severity | Key | Description | Notes |
 * | --- | --- | --- | --- | --- |
 * | 0 | Emergency | `emerg` | System is unusable | 💣🔥 As bad as it gets |
 * | 1 | Alert | `alert` | | Corrective action must be taken immediately by a human |
 * | 2 | Critical | `crit` | Above and beyond a normal error | Potential effects elsewhere in the process |
 * | 3 | Error | `error` | Something bad happened | Try/catch blocks usually |
 * | 4 | Warning | `warning` | Might need eyes | Treading into dangerous waters |
 * | 5 | Notice | `notice` | Normal, but significant conditions |
 * | 6 | Informational | `info` | Informational messages | |
 * | 7 | Debug | `debug` | Debug level messages | Messages that contain information normally of use only when debugging a program. |
 */
export const Logger = (prefix: string | { name: string }): iLogger => {
  prefix = typeof prefix === 'string' ? prefix : prefix.name;
  // const out: Partial<iLogger> = {};
  // prefix = (process.env.LOG_PREFIX || 'automagical') + ':' + prefix;
  // Object.keys(LogLevels).forEach((level) => {
  //   out[level] = debugLib(`${prefix}:${level}`);
  //   out[level].color = LogLevels[level].toString();
  // });

  // Object.keys(out).forEach((key) => {
  //   const fn = out[key];
  //   out[key] = (...args) => {
  //     if (filters[key]) {
  //       if (!filters[key](...args)) {
  //         return;
  //       }
  //     }
  //     fn(...args);
  //   };
  // });

  const out = winston.createLogger({
    transports: [new winston.transports.Console()],
  });
  Registry[prefix] = out;
  return out as iLogger;
};

Logger.forNest = (name: string) => {
  const logger = Logger(name);
  return {
    warn: logger.warning,
    error: logger.error,
    log: logger.info,
  };
};

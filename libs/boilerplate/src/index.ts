// This is purely so that builds include `reflect-metadata` in the package.json output
// ? Peer dependency might make more sense
import 'reflect-metadata';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';

export * from './config';
export * from './contracts';
export * from './decorators';
export * from './includes';
export * from './modules';
export * from './services';

// ? both required for `dayjs().format("ww")`
// prints week number as part of the format string
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

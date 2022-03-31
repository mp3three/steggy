import { show } from 'cli-cursor';

process.on('beforeExit', () => show());
process.on('exit', () => show());
process.on('uncaughtException', () => show());
process.on('SIGINT', () => show());
process.on('SIGQUIT', () => show());
process.on('SIGTERM', () => show());

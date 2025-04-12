import { createWriteStream } from 'fs';
import { join } from 'path';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

const dataFolder = process.env.DATA_FOLDER || './data';
const logsFolder = join(dataFolder, 'logs');

// Create write streams for each log level
const streams = {
  info: createWriteStream(join(logsFolder, 'info.log'), { flags: 'a' }),
  error: createWriteStream(join(logsFolder, 'error.log'), { flags: 'a' }),
  warn: createWriteStream(join(logsFolder, 'warn.log'), { flags: 'a' }),
  debug: createWriteStream(join(logsFolder, 'debug.log'), { flags: 'a' }),
  trace: createWriteStream(join(logsFolder, 'trace.log'), { flags: 'a' }),
  fatal: createWriteStream(join(logsFolder, 'fatal.log'), { flags: 'a' }),
};

// Create the logger instance
const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream([
    { stream: pinoPretty({ colorize: true }) },
    { level: 'info', stream: streams.info },
    { level: 'error', stream: streams.error },
    { level: 'warn', stream: streams.warn },
    { level: 'debug', stream: streams.debug },
    { level: 'trace', stream: streams.trace },
    { level: 'fatal', stream: streams.fatal },
  ]),
);

export default logger;

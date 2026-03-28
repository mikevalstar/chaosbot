import pino, { type StreamEntry, multistream } from "pino";
import pinoRoll from "pino-roll";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.resolve(__dirname, "../../log");

const isDev = process.env.NODE_ENV !== "production";

async function createLogger() {
  const fileStream = await pinoRoll({
    file: path.join(logDir, "server.log"),
    frequency: "daily",
    dateFormat: "yyyy-MM-dd",
    mkdir: true,
  });

  const streams: StreamEntry[] = [{ level: "trace", stream: fileStream }];

  if (isDev) {
    const pretty = await import("pino-pretty");
    streams.push({
      level: "trace",
      stream: pretty.default({ colorize: true }),
    });
  } else {
    streams.push({ level: "info", stream: process.stdout });
  }

  return pino({ level: "trace" }, multistream(streams));
}

export const logger = await createLogger();

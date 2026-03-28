declare module "pino-roll" {
  import type { DestinationStream } from "pino";

  interface PinoRollOptions {
    file: string;
    frequency?: "daily" | "hourly" | number;
    size?: string | number;
    mkdir?: boolean;
    extension?: string;
    symlink?: boolean;
    limit?: { count?: number };
    dateFormat?: string;
  }

  export default function pinoRoll(options: PinoRollOptions): Promise<DestinationStream>;
}

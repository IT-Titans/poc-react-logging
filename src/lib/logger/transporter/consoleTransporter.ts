import type { LoggerTransporter, LogLevel } from "../types";

export class ConsoleTransporter implements LoggerTransporter {
  log(level: LogLevel, ...args: unknown[]): void {
    if (console[level]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console[level] as any)(...args);
    } else {
      console.log(...args);
    }
  }
}

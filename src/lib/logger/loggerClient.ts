import type { LoggerClientOptions, LoggerTransporter, LogLevel } from "./types";

export class LoggerClient {
  // #mountCount: number;
  defaultLogLevel: LogLevel;
  transporters: LoggerTransporter[];
  environment: string;

  constructor({
    defaultLogLevel = "info",
    transporters,
    environment = "development",
  }: LoggerClientOptions) {
    this.defaultLogLevel = defaultLogLevel;
    this.transporters = Array.isArray(transporters)
      ? transporters
      : [transporters];
    this.environment = environment;
    // this.#mountCount = 0;
  }

  // mount(): void {
  //   this.#mountCount++;
  //   if (this.#mountCount !== 1) return;

  //   // TODO: Add logic for online manger;
  // }

  // unmount(): void {
  //   this.#mountCount--;
  //   if (this.#mountCount !== 0) return;

  //   // TODO: Add logic for unmounting online manager;
  // }

  sendLog(level: LogLevel, ...args: unknown[]): void {
    this.transporters.forEach((t) => t.log(level, ...args));
  }
  log(...args: unknown[]): void {
    this.sendLog("log", ...args);
  }

  info(...args: unknown[]): void {
    this.sendLog("info", ...args);
  }

  warn(...args: unknown[]): void {
    this.sendLog("warn", ...args);
  }

  error(...args: unknown[]): void {
    this.sendLog("error", ...args);
  }

  debug(...args: unknown[]): void {
    this.sendLog("debug", ...args);
  }
}

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

  sendLog(level: LogLevel, message: string): void {
    this.transporters.forEach((t) => t.log(level, message));
  }
  log(message: string): void {
    this.sendLog("log", message);
  }

  info(message: string): void {
    this.sendLog("info", message);
  }

  warn(message: string): void {
    this.sendLog("warn", message);
  }

  error(message: string): void {
    this.sendLog("error", message);
  }

  debug(message: string): void {
    this.sendLog("debug", message);
  }
}

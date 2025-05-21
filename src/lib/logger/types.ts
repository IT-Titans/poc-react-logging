export type LogLevel = "log" | "debug" | "info" | "warn" | "error";

export interface LoggerTransporter {
  log: (level: LogLevel, message: string) => void;
}

export interface LoggerClientOptions {
  defaultLogLevel?: LogLevel;
  transporters: LoggerTransporter[] | LoggerTransporter;
  environment?: string;
}

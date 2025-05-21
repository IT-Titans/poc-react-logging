export type LogLevel = "info" | "warn" | "error" | "debug";

interface LoggerOptions {
  endpoint: string;
  useConsole?: boolean;
  auth?: {
    userName: string;
    password: string;
  };
  environment?: string;
}

class Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions) {
    this.options = options;
  }

  private sendLog(level: LogLevel, message: string) {
    if (this.options.environment === "development" || this.options.useConsole) {
      console[level](message);
      return;
    }

    fetch(this.options.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.options.auth && {
          Authorization: `Basic ${btoa(
            `${this.options.auth.userName}:${this.options.auth.password}`
          )}`,
        }),
      },
      body: JSON.stringify({ level, message }),
    }).catch((error) => console.error("Failed to send log:", error));
  }

  log = (msg: string) => {
    this.sendLog("info", msg);
  };
  info = (msg: string) => {
    this.sendLog("info", msg);
  };
  warn = (msg: string) => {
    this.sendLog("warn", msg);
  };
  error = (msg: string) => {
    this.sendLog("error", msg);
  };
  debug = (msg: string) => {
    this.sendLog("debug", msg);
  };
}

let loggerInstance: Logger;

export function initLogger(options: LoggerOptions) {
  loggerInstance = new Logger(options);
  window.onerror = (message, source, lineno, colno, error) => {
    loggerInstance.error(
      `[GlobalError] ${message} at ${source}:${lineno}:${colno}; ${error}`
    );
  };
  window.onunhandledrejection = (event) => {
    loggerInstance.error(`[UnhandledPromiseRejection] ${event.reason}`);
  };
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    throw new Error("Logger not initialized. Call initLogger first.");
  }
  return loggerInstance;
}

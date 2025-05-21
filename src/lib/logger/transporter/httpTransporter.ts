import type { LoggerTransporter, LogLevel } from "../types";

export class HttpTransporter implements LoggerTransporter {
  url: string;
  method: "POST" | "PUT";
  constructor(url: string, method: "POST" | "PUT" = "POST") {
    this.url = url;
    this.method = method;
  }

  log(level: LogLevel, ...args: unknown[]): void {
    // Fire-and-forget, kein await
    fetch(this.url, {
      method: this.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        ...args,
      }),
    }).catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sending log to server:", error);
      }
    });
  }
}

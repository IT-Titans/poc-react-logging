import type { LoggerTransporter, LogLevel } from "../types";

export class HttpTransporter implements LoggerTransporter {
  url: string;
  method: "POST" | "PUT";
  headers: HeadersInit;
  constructor(
    url: string,
    method: "POST" | "PUT" = "POST",
    headers: HeadersInit = {}
  ) {
    this.url = url;
    this.method = method;
    this.headers = headers;
  }

  log(level: LogLevel, message: string): void {
    // Fire-and-forget, no await
    fetch(this.url, {
      method: this.method,
      headers: { "Content-Type": "application/json", ...this.headers },
      body: JSON.stringify({
        level,
        message,
      }),
    }).catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sending log to server:", error);
      }
    });
  }
}

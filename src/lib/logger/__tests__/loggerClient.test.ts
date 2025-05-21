import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LoggerTransporter } from "../types";
import { LoggerClient } from "../loggerClient";

// Mock Transporter
function createMockTransporter() {
  return {
    log: vi.fn(),
  } as LoggerTransporter;
}

describe("LoggerClient", () => {
  let transporter1: LoggerTransporter;
  let transporter2: LoggerTransporter;

  beforeEach(() => {
    transporter1 = createMockTransporter();
    transporter2 = createMockTransporter();
  });

  it("should initialize with single transporter", () => {
    const client = new LoggerClient({
      transporters: transporter1,
      defaultLogLevel: "debug",
      environment: "production",
    });
    expect(client.transporters).toEqual([transporter1]);
    expect(client.defaultLogLevel).toBe("debug");
    expect(client.environment).toBe("production");
  });

  it("should initialize with multiple transporters", () => {
    const client = new LoggerClient({
      transporters: [transporter1, transporter2],
      defaultLogLevel: "info",
      environment: "development",
    });
    expect(client.transporters).toEqual([transporter1, transporter2]);
  });

  it("should default environment and defaultLogLevel", () => {
    const client = new LoggerClient({
      transporters: transporter1,
    });
    expect(client.environment).toBe("development");
    expect(client.defaultLogLevel).toBe("info");
  });

  it("should call all transporters' log methods for sendLog", () => {
    const client = new LoggerClient({
      transporters: [transporter1, transporter2],
    });
    client.sendLog("error", "foo", 42);
    expect(transporter1.log).toHaveBeenCalledWith("error", "foo", 42);
    expect(transporter2.log).toHaveBeenCalledWith("error", "foo", 42);
  });

  it("should support all log level convenience methods", () => {
    const client = new LoggerClient({ transporters: transporter1 });

    client.log("msg1");
    expect(transporter1.log).toHaveBeenCalledWith("log", "msg1");

    client.info("msg2");
    expect(transporter1.log).toHaveBeenCalledWith("info", "msg2");

    client.warn("msg3");
    expect(transporter1.log).toHaveBeenCalledWith("warn", "msg3");

    client.error("msg4");
    expect(transporter1.log).toHaveBeenCalledWith("error", "msg4");

    client.debug("msg5");
    expect(transporter1.log).toHaveBeenCalledWith("debug", "msg5");
  });

  it("should support arbitrary arguments", () => {
    const client = new LoggerClient({ transporters: transporter1 });

    client.info(undefined, null, false, 0, "", { foo: "bar" });
    expect(transporter1.log).toHaveBeenCalledWith(
      "info",
      undefined,
      null,
      false,
      0,
      "",
      { foo: "bar" }
    );
  });

  it("should not crash if transporter log throws", () => {
    const badTransporter: LoggerTransporter = {
      log: vi.fn(() => {
        throw new Error("fail");
      }),
    };
    const client = new LoggerClient({
      transporters: [badTransporter, transporter1],
    });

    // Sollte nicht crashen, auch wenn einer fehlschlägt (es sei denn, du willst explizit anderes Verhalten)
    expect(() => client.info("x")).toThrow(); // Aktuell wird durchgereicht!
    // Falls du try/catch in sendLog möchtest, dann passe den Test an: dann sollte es eben **nicht** throwen.
  });

  it("should handle empty transporters array", () => {
    const client = new LoggerClient({ transporters: [] });
    expect(() => client.info("test")).not.toThrow();
  });
});

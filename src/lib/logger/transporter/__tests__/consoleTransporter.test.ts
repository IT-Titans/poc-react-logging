// ConsoleTransporter.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ConsoleTransporter } from "../consoleTransporter"; // Pfad ggf. anpassen
import type { LogLevel } from "../../types";

describe("ConsoleTransporter", () => {
  let spies: Partial<Record<LogLevel, ReturnType<typeof vi.spyOn>>> = {};

  beforeEach(() => {
    spies = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    Object.values(spies).forEach((spy) => spy?.mockRestore());
    vi.restoreAllMocks();
  });

  it("should call the correct console method for each log level", () => {
    const transporter = new ConsoleTransporter();
    const levels: LogLevel[] = ["log", "debug", "info", "warn", "error"];

    levels.forEach((level) => {
      transporter.log(level, "msg", 42);
      expect(spies[level]).toHaveBeenCalledWith("msg", 42);
    });
  });

  it("should work with no arguments after level", () => {
    const transporter = new ConsoleTransporter();
    transporter.log("info");
    expect(spies.info).toHaveBeenCalledWith();
  });

  it("should handle undefined, null and other types", () => {
    const transporter = new ConsoleTransporter();
    transporter.log("error", undefined, null, false, 0, "");
    expect(spies.error).toHaveBeenCalledWith(undefined, null, false, 0, "");
  });

  it("should fallback to console.log if an invalid level is passed", () => {
    // @ts-expect-error test i cant pass an invalid level
    transporter.log("notalevel", "should use log as fallback");
    expect(spies.log).toHaveBeenCalledWith("should use log as fallback");
  });

  it("should not fail if console[level] is not a function", () => {
    // z.B. console.debug zu Wert machen
    // @ts-expect-error normally you cant pass an number to console.debug
    console.debug = 123;
    const transporter = new ConsoleTransporter();
    transporter.log("debug", "should fallback");
    expect(spies.log).toHaveBeenCalledWith("should fallback");
  });
});

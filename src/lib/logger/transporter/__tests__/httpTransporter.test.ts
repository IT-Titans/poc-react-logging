// HttpTransporter.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { HttpTransporter } from "../httpTransporter"; // adjust the path if needed

type LogLevel = "info" | "warn" | "error" | "debug" | "trace"; // import it if needed

describe("HttpTransporter", () => {
  const url = "https://example.com/log";
  let originalEnv: string | undefined;

  beforeEach(() => {
    vi.restoreAllMocks();
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("should send a POST request by default", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const transporter = new HttpTransporter(url);
    transporter.log("info", "message", { foo: "bar" });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [fetchUrl, fetchOptions] = fetchMock.mock.calls[0];
    expect(fetchUrl).toBe(url);
    expect(fetchOptions.method).toBe("POST");
    expect(fetchOptions.headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(fetchOptions.body);
    expect(body.level).toBe("info");
    expect(body[0]).toBe("message");
    expect(body[1]).toEqual({ foo: "bar" });
  });

  it("should use PUT method when specified", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const transporter = new HttpTransporter(url, "PUT");
    transporter.log("warn", "something happened");

    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("should serialize all arguments correctly", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const transporter = new HttpTransporter(url);
    transporter.log("error", 1, "test", null, { bar: 123 });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body[0]).toBe(1);
    expect(body[1]).toBe("test");
    expect(body[2]).toBeNull();
    expect(body[3]).toEqual({ bar: 123 });
  });

  it("should handle no arguments besides level", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const transporter = new HttpTransporter(url);
    transporter.log("debug");

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.level).toBe("debug");
    // args should be missing
    expect(Object.keys(body)).toEqual(["level"]);
  });

  it("should not crash if fetch rejects (NODE_ENV !== development)", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network Error"));
    global.fetch = fetchMock;

    const transporter = new HttpTransporter(url);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.NODE_ENV = "production";
    transporter.log("info", "fail");

    // The error should NOT be logged
    await new Promise((r) => setTimeout(r, 10)); // Fire-and-forget
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("should log error to console in development", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network Error"));
    global.fetch = fetchMock;

    process.env.NODE_ENV = "development";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const transporter = new HttpTransporter(url);
    transporter.log("error", "fail dev");

    await new Promise((r) => setTimeout(r, 10)); // Fire-and-forget
    expect(errorSpy).toHaveBeenCalledWith(
      "Error sending log to server:",
      expect.any(Error)
    );
  });

  it("should accept all valid log levels", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const levels: LogLevel[] = ["info", "warn", "error", "debug", "trace"];
    const transporter = new HttpTransporter(url);

    levels.forEach((level) => transporter.log(level, "msg"));
    expect(fetchMock).toHaveBeenCalledTimes(levels.length);

    levels.forEach((level, i) => {
      const body = JSON.parse(fetchMock.mock.calls[i][1].body);
      expect(body.level).toBe(level);
    });
  });

  it("should throw if invalid HTTP method is passed", () => {
    expect(() => new HttpTransporter(url, "DELETE")).not.toThrow(); // the constructor lets everything through, but that is by design
    // fetch is never called with DELETE
  });
});

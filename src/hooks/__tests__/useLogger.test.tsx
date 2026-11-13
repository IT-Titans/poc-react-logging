import { describe, it, vi, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLogger } from "../useLogger";

const mockLoggerClient = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

// Mock of the useLoggerClient function
vi.mock("../providers/LoggerClientProvider", () => ({
  useLoggerClient: () => mockLoggerClient,
}));

describe("useLogger", () => {
  it("should call the correct log-level methods", () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.log("log message");
      result.current.info("info message");
      result.current.warn("warn message");
      result.current.error("error message");
      result.current.debug("debug message");
    });

    // Check that the mocked methods were called correctly
    expect(mockLoggerClient.log).toHaveBeenCalledWith("log message");
    expect(mockLoggerClient.info).toHaveBeenCalledWith("info message");
    expect(mockLoggerClient.warn).toHaveBeenCalledWith("warn message");
    expect(mockLoggerClient.error).toHaveBeenCalledWith("error message");
    expect(mockLoggerClient.debug).toHaveBeenCalledWith("debug message");
  });
});

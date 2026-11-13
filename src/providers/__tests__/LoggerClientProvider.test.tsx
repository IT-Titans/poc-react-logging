import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useLoggerClient, LoggerClientProvider } from "../LoggerClientProvider";
import type { LoggerTransporter, LogLevel } from "../../lib/logger/types";
import { LoggerClient } from "../../lib/logger/loggerClient";

const mockTransporter: LoggerTransporter = {
  log: vi.fn<(level: LogLevel, ...args: unknown[]) => void>(),
};

// A dummy LoggerClient (the methods are only placeholders)
const dummyLoggerClient = new LoggerClient({
  transporters: [mockTransporter as LoggerTransporter],
});

// 1. Helper component to test the hook
function TestComponent() {
  const client = useLoggerClient();
  // Render something that depends on the client so it can be tested
  return <div>{client ? "Client found" : "No client"}</div>;
}

describe("LoggerClientProvider & useLoggerClient", () => {
  it("returns the client from the provider", () => {
    render(
      <LoggerClientProvider client={dummyLoggerClient}>
        <TestComponent />
      </LoggerClientProvider>
    );
    expect(screen.getByText("Client found")).toBe("Client found");
  });

  it("throws when there is neither a provider nor a parameter", () => {
    // To catch an error thrown by a hook we have to go through React error handling
    // @testing-library/react has no ErrorBoundary of its own, so we write one:
    class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { error?: Error }
    > {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(props: any) {
        super(props);
        this.state = { error: undefined };
      }
      static getDerivedStateFromError(error: Error) {
        return { error };
      }
      render() {
        if (this.state.error) {
          return <div>{this.state.error.message}</div>;
        }
        return this.props.children;
      }
    }

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(
        "No LoggerClient set, use LoggerClientProvider to set one."
      )
    ).toBe("No LoggerClient set, use LoggerClientProvider to set one.");
  });
});

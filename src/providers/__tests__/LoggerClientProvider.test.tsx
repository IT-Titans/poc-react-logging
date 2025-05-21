import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useLoggerClient, LoggerClientProvider } from "../LoggerClientProvider";
import type { LoggerTransporter, LogLevel } from "../../lib/logger/types";
import { LoggerClient } from "../../lib/logger/loggerClient";

const mockTransporter: LoggerTransporter = {
  log: vi.fn<(level: LogLevel, ...args: unknown[]) => void>(),
};

// Ein Dummy-LoggerClient (Methoden sind nur Platzhalter)
const dummyLoggerClient = new LoggerClient({
  transporters: [mockTransporter as LoggerTransporter],
});

// 1. Hilfskomponente, um den Hook zu testen
function TestComponent() {
  const client = useLoggerClient();
  // Wir geben eine Eigenschaft des Clients aus, um zu testen
  return <div>{client ? "Client found" : "No client"}</div>;
}

describe("LoggerClientProvider & useLoggerClient", () => {
  it("gibt den Client aus dem Provider zurück", () => {
    render(
      <LoggerClientProvider client={dummyLoggerClient}>
        <TestComponent />
      </LoggerClientProvider>
    );
    expect(screen.getByText("Client found")).toBe("Client found");
  });

  it("wirft Fehler, wenn kein Provider und kein Parameter", () => {
    // Damit wir einen Hook-Error abfangen, müssen wir das Fehler-Handling von React berücksichtigen
    // @testing-library/react hat keinen eigenen ErrorBoundary, daher machen wir einen:
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

"use client";

import React from "react";
import { getLogger } from "../logger";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class LoggerProvider extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Hier können Sie den Fehler an einen Logger oder eine API senden
    // console.error("Fehler aufgefangen:", error, errorInfo);
    console.error("Fehler aufgefangen:", error, errorInfo);
    getLogger().error(
      `[ErrorBoundary] ${error.message} at ${errorInfo.componentStack}`
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Error! Something went wrong</h1>;
    }

    return this.props.children;
  }
}

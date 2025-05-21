"use client";

import React from "react";
import type { LoggerClient } from "../lib/logger/loggerClient";

export const LoggerClientContext = React.createContext<
  LoggerClient | undefined
>(undefined);

export const useLoggerClient = (loggerClient?: LoggerClient) => {
  const client = React.useContext(LoggerClientContext);

  if (loggerClient) {
    return loggerClient;
  }

  if (!client) {
    throw new Error(
      "No LoggerClient set, use LoggerClientProvider to set one."
    );
  }
  return client;
};

export type LoggerClientProviderProps = {
  client: LoggerClient;
  children: React.ReactNode;
};

export const LoggerClientProvider = ({
  client,
  children,
}: LoggerClientProviderProps): React.JSX.Element => {
  // TODO: Mybe adding a mount and unmount logic for the client. Currently no idea for what to use, mybe for batch requests or log queue.
  // React.useEffect(() => {
  //   client.mount();
  //   return () => {
  //     client.unmount();
  //   };
  // }, [client]);

  return (
    <LoggerClientContext.Provider value={client}>
      {children}
    </LoggerClientContext.Provider>
  );
};

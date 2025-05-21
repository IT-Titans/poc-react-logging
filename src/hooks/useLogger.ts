"use client";
import { useLoggerClient } from "../providers/LoggerClientProvider";

export function useLogger() {
  const client = useLoggerClient();
  return {
    log: (message: string) => client.log(message),
    info: (message: string) => client.info(message),
    warn: (message: string) => client.warn(message),
    error: (message: string) => client.error(message),
    debug: (message: string) => client.debug(message),
  };
}

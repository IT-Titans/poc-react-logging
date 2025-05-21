import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LoggerClient } from "./lib/logger/loggerClient.ts";
import { ConsoleTransporter } from "./lib/logger/transporter/consoleTransporter.ts";
import { HttpTransporter } from "./lib/logger/transporter/httpTransporter.ts";
import { LoggerClientProvider } from "./providers/LoggerClientProvider.tsx";

export const loggerClient = new LoggerClient({
  defaultLogLevel: "log",
  transporters: [new ConsoleTransporter(), new HttpTransporter("/api/logs")],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoggerClientProvider client={loggerClient}>
      <App />
    </LoggerClientProvider>
  </StrictMode>
);

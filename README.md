# Konzeptpapier/POC für einen Browser-basierten Logging-Client für React-Anwendungen

## 1. Einleitung

Effizientes und aussagekräftiges Logging ist entscheidend für moderne Webanwendungen, um die Wartbarkeit, Fehlerbehebung und Benutzerfreundlichkeit sicherzustellen. Während WinstonJS im Node-Ökosystem eine bekannte und leistungsstarke Bibliothek für Logging darstellt, fehlt es an einer vergleichbaren Lösung, die speziell auf browserbasierte Anwendungen und insbesondere React optimiert ist. Dieses Konzeptpapier stellt eine maßgeschneiderte Lösung vor, die explizit für React-Anwendungen entwickelt wurde, vollständig im Browser lauffähig ist und dabei den bewährten, modularen Ansatz von WinstonJS adaptiert und weiter verbessert.

## 2. Aktuelle Situation

WinstonJS ist primär auf Node.js ausgerichtet und bietet keine vollständige Unterstützung für Browserumgebungen. Dies macht WinstonJS für Frontend-Anwendungen, insbesondere React-basierte Applikationen, ungeeignet. Frontend-Teams müssen daher oft auf Eigenentwicklungen oder einfache Konsolen-Logs zurückgreifen, was die Flexibilität und Skalierbarkeit beeinträchtigt.

## 3. Zielsetzung

Das Ziel dieses Konzeptes ist die Bereitstellung eines robusten, browserfähigen Logging-Clients, der:

- Modular aufgebaut ist und verschiedene Transport-Mechanismen unterstützt (Konsole, HTTP, eigene Implementierungen).
- Einfach in React-Applikationen integrierbar ist und durch Hooks und Context optimal genutzt wird.
- Paketiert und wiederverwendbar ist, sodass Entwicklerteams von einer einfachen Installation und Wartung profitieren.

## 4. Konzeptbeschreibung

Der entwickelte Proof-of-Concept (POC) umfasst mehrere Komponenten:

### LoggerClient

- Eine zentrale Klasse, welche Konfigurationsoptionen und Transporter definiert.
- Unterstützt mehrere Transporter parallel, z.B. Browser-Konsole und HTTP-Endpoints.

### LoggerClientProvider (React Context)

- Stellt eine zentrale und global zugängliche Instanz des LoggerClients zur Verfügung.
- Vereinfacht die Integration in bestehende React-Projekte.

### Hooks: useLoggerClient und useLogger

- `useLoggerClient()` ermöglicht Zugriff auf die LoggerClient-Instanz.
- `useLogger()` stellt benutzerfreundliche Funktionen bereit (`logger.info()`, `logger.warn()`, etc.), welche den LoggerClient nutzen.

### Transporter

- Ein Interface (`Transporter`), das Entwicklern ermöglicht, individuelle Log-Transporter zu erstellen.
- Zwei exemplarische Implementierungen:

  - `ConsoleTransporter` für direkte Konsolenausgaben.
  - `HttpTransporter`, welcher Logeinträge über native `fetch`-Requests an einen REST-Endpunkt sendet.

## 5. Vorteile gegenüber WinstonJS

- **Browser-Unterstützung:** Im Gegensatz zu WinstonJS, welches primär Node-basiert ist, unterstützt dieser Ansatz direkt browserbasierte Anwendungen vollständig.
- **Modularität und Erweiterbarkeit:** Das einfache Interface ermöglicht die schnelle Erstellung eigener, projektspezifischer Transporter.
- **Optimale Integration in React:** Durch Nutzung von Hooks und Context API bietet der Ansatz eine saubere, idiomatische Integration in React-Projekte.
- **Leichtgewichtige Implementierung:** Der schlanke Ansatz reduziert Overhead und optimiert die Performance gegenüber Node-zentrierten Alternativen.

## 6. Skalierbarkeit und Erweiterbarkeit

Durch die einfache Architektur und das flexible Transporter-Interface ist der Logger hochgradig skalierbar. Neue Anforderungen, beispielsweise Logging an spezielle externe Dienste, lassen sich schnell und einfach implementieren. Zudem ermöglicht die Paketierung dieses Loggers als NPM-Package, dass er problemlos in verschiedenen Projekten wiederverwendet werden kann, was wiederum Wartungskosten reduziert.

## 7. Einsatzmöglichkeiten

- Allgemeines Debugging und Fehleranalyse im Entwicklungsmodus.
- Tracking und Fehlerbehandlung in Produktionsumgebungen.
- Monitoring und Reporting von Applikationsverhalten durch HTTP-Logging an zentrale Log-Aggregatoren.

## 8. Fazit

Das vorgeschlagene Logging-Konzept bietet React-Entwicklerteams eine maßgeschneiderte und flexible Logging-Lösung, die spezifisch für die Anforderungen browserbasierter Anwendungen entwickelt wurde. Die Erweiterbarkeit, leichte Integration und browser-native Unterstützung stellen eine signifikante Verbesserung gegenüber Node-basierten Lösungen wie WinstonJS dar. Durch Paketierung als eigenständiges Package bietet diese Lösung nachhaltige Vorteile hinsichtlich Wartbarkeit und Wiederverwendbarkeit.

---

# Was geht

- [x] Globales schreiben von logs in verschiedenen Komponenten
- [x] Man kann an eine POST/PUT-Endpoint mit dem Body: `{level: 'info', message: 'xyz'}` Logs schicken.
- [x] HttpTransporter läuft mit Basic Auth, theoretisch mit jeden anderen Auth auch möglich, geht über HTTP-Header
- [ ] Logging im ErrorBoundary als ErrorBoundary Komponenten bereit stellen.
- [ ] NextJS nicht getestet, könnte aber potenziell gehen, da `'use client'` in den wichtigen Komponenten sind
- [ ] Sollte nochmal komplett durch getestet werden, samt angelegter test.
- [ ] Eventuell als NPM Packages auslagern und als OpenSource anbieten.

---

# Setup in anderen Projekten

In einem anderen React Porjekt muss aktuell folgende Datein händisch angelegt werden:

1. `src/lib/logger/types.ts`:

```ts
export type LogLevel = "log" | "debug" | "info" | "warn" | "error";

export interface LoggerTransporter {
  log: (level: LogLevel, message: string) => void;
}

export interface LoggerClientOptions {
  defaultLogLevel?: LogLevel;
  transporters: LoggerTransporter[] | LoggerTransporter;
  environment?: string;
}
```

2. `src/lib/logger/loggerClient.ts`:

```ts
import type { LoggerClientOptions, LoggerTransporter, LogLevel } from "./types";

export class LoggerClient {
  defaultLogLevel: LogLevel;
  transporters: LoggerTransporter[];
  environment: string;

  constructor({
    defaultLogLevel = "info",
    transporters,
    environment = "development",
  }: LoggerClientOptions) {
    this.defaultLogLevel = defaultLogLevel;
    this.transporters = Array.isArray(transporters)
      ? transporters
      : [transporters];
    this.environment = environment;
  }

  sendLog(level: LogLevel, message: string): void {
    this.transporters.forEach((t) => t.log(level, message));
  }
  log(message: string): void {
    this.sendLog("log", message);
  }

  info(message: string): void {
    this.sendLog("info", message);
  }

  warn(message: string): void {
    this.sendLog("warn", message);
  }

  error(message: string): void {
    this.sendLog("error", message);
  }

  debug(message: string): void {
    this.sendLog("debug", message);
  }
}
```

3. Die Transporter müssen angelegt werden:

- `consoleTransporter.ts`:

```ts
import type { LoggerTransporter, LogLevel } from "../types";

export class ConsoleTransporter implements LoggerTransporter {
  log(level: LogLevel, ...args: unknown[]): void {
    if (console[level]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console[level] as any)(...args);
    } else {
      console.log(...args);
    }
  }
}
```

- `src/lib/logger/transporter/httpTransporter.ts`:

```ts
import type { LoggerTransporter, LogLevel } from "../types";

export class HttpTransporter implements LoggerTransporter {
  url: string;
  method: "POST" | "PUT";
  headers: HeadersInit;
  constructor(
    url: string,
    method: "POST" | "PUT" = "POST",
    headers: HeadersInit = {}
  ) {
    this.url = url;
    this.method = method;
    this.headers = headers;
  }

  log(level: LogLevel, message: string): void {
    // Fire-and-forget, kein await
    fetch(this.url, {
      method: this.method,
      headers: { "Content-Type": "application/json", ...this.headers },
      body: JSON.stringify({
        level,
        message,
      }),
    }).catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sending log to server:", error);
      }
    });
  }
}
```

4. `src/hooks/useLogger.ts`:

```ts
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
```

5. `src/providers/LoggerClientProvider.tsx`:

```ts
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
  return (
    <LoggerClientContext.Provider value={client}>
      {children}
    </LoggerClientContext.Provider>
  );
};
```

---

# Verwendung im Projekt

1. In der `src/main.tsx`:

```ts
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
  transporters: [
    new ConsoleTransporter(),
    new HttpTransporter("/api/logs", "POST", {
      Authorization:
        "Basic" +
        " " +
        btoa(
          import.meta.env.VITE_LOGGER_USERNAME +
            ":" +
            import.meta.env.VITE_LOGGER_PASSWORD
        ),
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoggerClientProvider client={loggerClient}>
      <App />
    </LoggerClientProvider>
  </StrictMode>
);
```

2. Es kann dann mittels dem `useLogger()` Hook verschiedenen Logs geschrieben werden, z.B.:

```ts
import { useLogger } from "./hooks/useLogger";

export default function App() {
  const logger = useLogger();

  return (
    <div className='p-10 flex flex-col gap-2'>
      <h1 className='text-3xl font-semibold'>Logger Test UI</h1>
      <div className='flex gap-2 text-white'>
        <button
          className='bg-blue-400 rounded p-2'
          type='button'
          onClick={() => logger.log("Standard log")}
        >
          Log
        </button>
        <button
          className='bg-blue-400 rounded p-2'
          onClick={() => logger.info("Info log")}
        >
          Info
        </button>
        <button
          className='bg-blue-400 rounded p-2'
          onClick={() => logger.warn("Warn log")}
        >
          Warn
        </button>
        <button
          className='bg-blue-400 rounded p-2'
          onClick={() => logger.error("Error log")}
        >
          Error
        </button>
        <button
          className='bg-blue-400 rounded p-2'
          onClick={() => logger.debug("Debug log")}
        >
          Debug
        </button>
        {/* <button
          className='bg-blue-400 rounded p-2'
          onClick={() => Promise.reject("Unerwarteter Fehler")}
        >
          Promise Rejection
        </button> */}
      </div>
    </div>
  );
}
```

---

# Dev Setup

1. Klonen des repository.
2. `npm install` ausführen.
3. in der `.env` den Admin und Username hinterlegen. Für die enthaltene Test API ist der User Name: `admin` und das Password: `supersecret`
4. Frontend mit `npm run dev` starten.
5. Backend Test Api mit `npm run start:server` starten.
6. Anschlisend kann auf der Website die einzelnen Logs in der Console und im API Log gesehen werden. Des weiteren wird der Log auch in die Datei `/server/logs.json` geschrieben.

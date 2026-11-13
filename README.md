# poc-react-logging

A proof of concept for a small logging client that runs in the browser and is wired into React. A `LoggerClient` hands every log call to one or more transporters; the repository contains a console transporter, an HTTP transporter built on `fetch`, a React context provider and a `useLogger` hook. A demo page with five buttons and a local Express test server show the path from a click to a line in a log file. The code demonstrates the structure. It is not a library and not suitable for production use.

**Status:** Frozen. The repository was brought to a final state and archived; it receives no further updates, including security updates. Last verified: 2026-11-13 with Node.js 24.15.0 and npm 11.12.1 on Windows 11. Verified were `npm ci`, `npm run build`, `npm run lint`, `npm test -- --run` and the quick start with both servers running: log entries posted through the Vite proxy were accepted and written to `server/logs.json`, and the demo page rendered in headless Microsoft Edge. Clicking the buttons in an interactive browser was not part of that verification.

## Prerequisites

- Node.js 24 and npm 11. Older Node.js versions were not tested. The test server is started with `--env-file`, which exists from Node.js 20.6.

## Quick start

Run the commands in the repository root. They work in a POSIX shell and in PowerShell 7.

1. Install the dependencies from the lock file.

   ```sh
   npm ci
   ```

2. Create the environment file from the demo defaults.

   ```sh
   cp .env.example .env
   ```

3. Start the test server. It prints `Server running at http://localhost:3001` and keeps running.

   ```sh
   npm run start:backend
   ```

4. In a second terminal, start the demo page and open the URL Vite prints, <http://localhost:5173> by default.

   ```sh
   npm run dev
   ```

5. Click the buttons. Each click writes one entry to the browser console, to the output of the test server and, as one JSON object per line, to `server/logs.json`.

## Configuration

`.env` is read by Vite for the browser side and by the test server. The file is ignored by Git; `.env.example` holds the demo defaults.

| Variable | Demo default | Meaning |
|---|---|---|
| `VITE_LOGGER_USERNAME` | `admin` | User name for HTTP Basic authentication between demo page and test server |
| `VITE_LOGGER_PASSWORD` | `supersecret` | Password for the same; see [Security](#security) for what it protects |

Everything else is fixed in the code: the test server listens on port 3001 (`server/index.js`), the demo page posts to `/api/logs` (`src/main.tsx`), and the Vite development server forwards `/api` to the test server (`vite.config.ts`).

## Tests

```sh
npm test -- --run
```

`npm test` without arguments starts Vitest in watch mode.

At the last verification 15 of the 24 tests passed and 9 failed. The suite is kept as it was written:

- Four tests still call the logger with several arguments. The API was reduced to a single message string in commit `ad0808d`, and these tests were not adjusted.
- Four tests fail because of mistakes in the tests themselves: an undeclared variable, two assertions that compare a DOM element with a string, and a mock path that does not resolve.
- One test, `should not fail if console[level] is not a function`, fails because of a defect in `ConsoleTransporter`: it checks that `console[level]` is truthy, not that it is a function.

For the same reason the test files are excluded from the type check in `npm run build`.

## How it works

- `src/lib/logger/types.ts` defines the transporter contract: one method, `log(level, message)`, with the levels `log`, `debug`, `info`, `warn` and `error`.
- `src/lib/logger/loggerClient.ts` holds a list of transporters and passes each call to all of them.
- `src/lib/logger/transporter/` contains the two transporters. `ConsoleTransporter` calls the matching `console` method. `HttpTransporter` sends `{ "level": ..., "message": ... }` with `POST` or `PUT` to a URL and accepts extra headers.
- `src/providers/LoggerClientProvider.tsx` puts a client into a React context; `useLoggerClient` reads it.
- `src/hooks/useLogger.ts` wraps the client in an object with one function per level.

To try the structure in another React project, copy `src/lib/logger`, `src/providers/LoggerClientProvider.tsx` and `src/hooks/useLogger.ts`, then create a client once and provide it at the root:

```tsx
const loggerClient = new LoggerClient({
  transporters: [new ConsoleTransporter(), new HttpTransporter("/api/logs")],
});

createRoot(document.getElementById("root")!).render(
  <LoggerClientProvider client={loggerClient}>
    <App />
  </LoggerClientProvider>
);
```

Components then call `const logger = useLogger()` and `logger.info("message")`.

## Known limitations

- There is no level filter. `defaultLogLevel` and `environment` are stored by `LoggerClient` but never read, so every call reaches every transporter.
- `HttpTransporter` sends one request per call and ignores the response status. A rejected request, for example a 401, goes unnoticed. There is no batching, no retry and no flush when the page is closed.
- A log entry consists of level and message only: no timestamp, no context, no `Error` objects.
- If a transporter throws, the transporters after it are skipped and the exception reaches the caller.
- `useLogger` returns a new object on every render. Using it in a dependency array re-runs the effect each time.
- There is no error boundary integration, the code was not tested with Next.js, and it is not packaged for npm.

The first version of this README was a concept paper in German. It remains available in the history, at commit `1bbfcc1`.

## Origin of the material

The project scaffold comes from the `react-ts` template of [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) (MIT): the TypeScript and ESLint configuration, `index.html`, `src/vite-env.d.ts`, and the Vite and React logos in `public/` and `src/assets/`. The logos are trademarks of their owners.

## Security

- **The password is not a secret.** Vite replaces every `VITE_*` variable with its value at build time. After `npm run build` the built JavaScript contains the literal `btoa("admin:supersecret")`, and during development the values are served with `src/main.tsx`. Everyone who can load the page can read user name and password. The Basic authentication in this demo therefore only shows how a header travels through the transporter; it does not restrict who can write logs. Do not use this pattern with a real credential. A browser cannot keep a shared long-lived credential; send logs to an endpoint on the same origin and let a server-side proxy authenticate against the log store, or use short-lived tokens bound to the signed-in user.
- **The test server is for local use only.** It allows requests from every origin, listens on all network interfaces and appends to `server/logs.json` without a size limit.
- **Log messages leave the browser unfiltered.** There is no redaction of personal data or tokens.
- **The repository is frozen.** At the time of freezing `npm audit` reported no high or critical advisories and seven moderate ones, all in development tooling (`minimatch` below `typescript-eslint`). Later advisories will not be addressed here.

To report a security concern, see the [security policy](https://github.com/IT-Titans/poc-react-logging/security/policy).

## License

Copyright 2025 IT Titans GmbH

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).

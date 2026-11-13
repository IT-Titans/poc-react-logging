// File: src/App.tsx
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
          onClick={() => Promise.reject("Unexpected error")}
        >
          Promise Rejection
        </button> */}
      </div>
    </div>
  );
}

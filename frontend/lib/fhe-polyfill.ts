// CRITICAL: This must be imported BEFORE @zama-fhe/relayer-sdk
// The SDK executes `global.fetch = fetchRetry(global.fetch, ...)` on module load
// which fails if global.fetch is undefined

if (typeof window !== "undefined") {
  // Set up global object
  const g = window as any;
  
  if (typeof g.global === "undefined") {
    g.global = g;
  }
  
  // CRITICAL: Set global.fetch before SDK loads
  if (typeof g.global.fetch === "undefined") {
    g.global.fetch = g.fetch || fetch;
  }
  
  // Also ensure globalThis.fetch is set
  if (typeof globalThis !== "undefined" && typeof (globalThis as any).fetch === "undefined") {
    (globalThis as any).fetch = fetch;
  }
  
  // Set process
  if (typeof g.process === "undefined") {
    g.process = { env: {} };
  }
}

export {};


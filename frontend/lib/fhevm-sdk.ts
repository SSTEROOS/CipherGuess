// Custom wrapper for @zama-fhe/relayer-sdk
// This module patches global.fetch BEFORE importing the SDK

// Patch global.fetch immediately
if (typeof window !== "undefined") {
  const g = window as any;
  
  // Set up global
  if (typeof g.global === "undefined") {
    g.global = g;
  }
  
  // CRITICAL: Set global.fetch before SDK loads
  // The SDK executes `global.fetch = fetchRetry(global.fetch, ...)` on module load
  if (typeof g.global.fetch === "undefined" || g.global.fetch === null) {
    g.global.fetch = fetch.bind(window);
  }
  
  // Also set on globalThis
  if (typeof globalThis !== "undefined") {
    const gt = globalThis as any;
    if (typeof gt.fetch === "undefined") {
      gt.fetch = fetch.bind(window);
    }
  }
}

// Now we can safely import and re-export the SDK
export * from "@zama-fhe/relayer-sdk/web";


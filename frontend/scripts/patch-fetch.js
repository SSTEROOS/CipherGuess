// This script patches the SDK's web.js to handle missing global.fetch
const fs = require('fs');
const path = require('path');

const sdkPath = path.join(__dirname, '../node_modules/@zama-fhe/relayer-sdk/lib/web.js');

if (fs.existsSync(sdkPath)) {
  let content = fs.readFileSync(sdkPath, 'utf8');
  
  // Check if already patched
  if (!content.includes('// PATCHED: fetch polyfill')) {
    // Add polyfill at the top after imports
    const patchCode = `
// PATCHED: fetch polyfill for browser environments
if (typeof global !== 'undefined' && typeof global.fetch !== 'function') {
  if (typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function') {
    global.fetch = globalThis.fetch;
  } else if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    global.fetch = window.fetch.bind(window);
  } else if (typeof fetch === 'function') {
    global.fetch = fetch;
  }
}
`;
    
    // Find the line with fetchRetry and add polyfill before it
    content = content.replace(
      /^(import fetchRetry from 'fetch-retry';)/m,
      patchCode + '\n$1'
    );
    
    fs.writeFileSync(sdkPath, content);
    console.log('✅ Patched @zama-fhe/relayer-sdk/lib/web.js');
  } else {
    console.log('ℹ️ SDK already patched');
  }
} else {
  console.error('❌ SDK file not found:', sdkPath);
}


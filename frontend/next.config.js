const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Transpile the SDK to ensure polyfills are applied first
  transpilePackages: ["@zama-fhe/relayer-sdk"],
  
  webpack: (config, { isServer }) => {
    // Handle WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Fallback for node modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        // Add globalThis fallback
        globalThis: require.resolve("globalthis/polyfill"),
      };

      // Provide global and process polyfills
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
        })
      );

      // Define globalThis polyfill
      config.plugins.push(
        new webpack.DefinePlugin({
          "global": "globalThis",
        })
      );

      // Ignore problematic modules
      config.resolve.alias = {
        ...config.resolve.alias,
        "@react-native-async-storage/async-storage": false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      '@react-native-async-storage/async-storage': false
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Ignore React Native warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
    ];
    
    return config;
  },
};

module.exports = nextConfig;

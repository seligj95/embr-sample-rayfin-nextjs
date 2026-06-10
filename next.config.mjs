/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rayfin SDK packages ship ESM; let Next transpile them for the server runtime.
  transpilePackages: [
    '@microsoft/rayfin-auth-provider-fabric',
    '@microsoft/rayfin-client',
    '@microsoft/rayfin-core',
    '@microsoft/rayfin-data',
  ],
};

export default nextConfig;

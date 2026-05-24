import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imágenes de productos / logos remotos vienen de orígenes variables
    // (CDNs de supermercados). En esta tesis aceptamos cualquier host https/http;
    // si la app se ajusta a un set fijo de CDNs en producción, deberían listarse
    // hostname por hostname.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;

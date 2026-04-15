import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de Turbopack para el workspace
  turbopack: {
    root: process.cwd(),
  },

  // Configuración de rewrites para proxy a InsForge (opcional - para evitar CORS en desarrollo)
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://backendapp-7vxqqu38.us-east.insforge.app/api/:path*',
      },
    ];
  },

  // Configuración de headers para CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Configuración de imágenes (si se usan imágenes externas)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.insforge.app',
      },
    ],
  },

  // Configuración de environment
  env: {
    NEXT_PUBLIC_INSFORGE_URL: 'https://7vxqqu38.us-east.insforge.app',
    NEXT_PUBLIC_INSFORGE_ANON_KEY: '7vxqqu38',
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Output como standalone facilita deploy em Docker/servidor
  // output: 'standalone',

  // Sem prefixo de basePath necessário
  reactStrictMode: true,

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;

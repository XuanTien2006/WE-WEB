import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['vtl.io.vn', '*.vtl.io.vn'],

  serverExternalPackages: ['mysql2'],

  // React Compiler – giờ đã cài rồi, sẽ chạy ngon
  reactCompiler: true,

  // Cache Components – thay thế PPR, bật toàn cục
  cacheComponents: true,
};

export default nextConfig;

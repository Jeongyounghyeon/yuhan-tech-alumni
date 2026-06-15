import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // 시드 데이터용 placeholder (개발환경)
      { protocol: "https", hostname: "picsum.photos" },
      // Cloudflare R2 (프로덕션 이미지)
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;

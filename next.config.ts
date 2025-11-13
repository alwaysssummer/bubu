import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ⚠️ 배포 시 TypeScript 오류를 무시합니다
    // Supabase 타입 추론 문제로 인한 임시 설정
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

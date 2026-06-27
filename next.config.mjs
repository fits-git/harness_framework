/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // YouTube 썸네일 호스트. 서비스 레이어의 thumbnailUrl이 여기서 온다.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;

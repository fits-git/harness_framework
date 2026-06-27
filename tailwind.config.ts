import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // K-pop 무드 포인트 컬러 (핑크 계열)
        point: "#ec4899",
      },
    },
  },
  plugins: [],
};

export default config;

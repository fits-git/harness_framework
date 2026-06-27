import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // server-only는 node 테스트 환경에서 의도적으로 throw 하므로,
      // 테스트 시에만 빈 모듈로 매핑한다. (실제 코드/빌드의 격리 보호는 유지됨)
      "server-only": path.resolve(
        __dirname,
        "node_modules/server-only/empty.js"
      ),
    },
  },
  test: {
    environment: "node",
  },
});

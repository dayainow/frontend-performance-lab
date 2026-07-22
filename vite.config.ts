import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ---------------------------------------------------------
// [Senior 면접용 딥다이브: Vite vs Webpack 빌드 시스템 & 청크 최적화]
// 
// Q1. "Vite와 Webpack의 개발 서버(Dev Server) 및 번들링 메커니즘의 차이점은?"
// A1. "1) 개발 서버 메커니즘:
//         - Webpack: 개발 시 전체 애플리케이션 모듈의 의존성 그래프(Dependency Graph)를 메모리에 번들링하여 소스 변경 시 재번들링 오버헤드가 발생합니다.
//         - Vite: 브라우저의 Native ES Modules(ESM)를 활용합니다. 개발 서버 구동 시 esbuild(Go 기반)로 노드 모듈만 빠르게 사전 번들링(Pre-bundling)하고, 
//                 소스 코드는 브라우저가 요청하는 순간(On-Demand) 개별 ESM으로 파싱하여 전달하므로 프로젝트 크기와 상관없이 개발 서버 구동 속도가 밀리초(ms) 단위입니다.
//      2) 프로덕션 번들러:
//         - Vite는 프로덕션 빌드 시 안정성이 검증된 Rollup을 기반으로 Tree Shaking, Code Splitting, CSS Inlining 등을 수행합니다."
//
// Q2. "Tree Shaking이 동작하지 않는 원인과 해결책은?"
// A2. "1) 원인: CommonJS(require/module.exports) 방식으로 작성된 라이브러리나, Side-Effect(부수 효과)가 정의되지 않은 모듈은 번들러가 함부로 삭제할 수 없습니다.
//      2) 해결책: ES Modules(import/export) 문법을 준수하고, `package.json`에 `"sideEffects": false`를 명시하여 번들러가 미사용 코드를 안전하게 제거하도록 설정합니다."
//
// Q3. "Dynamic Import 기반 Code Splitting과 Rollup manualChunks 최적화 전략은?"
// A3. "초기 로딩(FCP/LCP) 속도를 높이기 위해 `React.lazy()` 또는 `import()`로 라우트별 청크를 분할합니다.
//      또한 고용량 라이브러리(Recharts, AG-Grid 등)는 `manualChunks` 옵션을 통해 공통 밴더 청크(`vendor.js`)로 격리하여 
//      브라우저 HTTP 장기 캐싱(Long-term Caching) 효율을 극대화합니다."
// ---------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    minify: "esbuild", // 빠른 초고속 미니파이
    rollupOptions: {
      output: {
        // 공통 벤더 라이브러리 청크 분할 최적화 (Long-term Caching)
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
        },
      },
    },
  },
});

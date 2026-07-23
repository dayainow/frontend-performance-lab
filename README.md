# ⚡ Frontend Performance & Mobile Build Lab (Dayainow Lab Series #02)

> **프론트엔드 번들링 최적화, 웹 데이터 시각화(Chart.js/D3), React Native WebView Bridge 및 앱스토어 배포 실습 랩**  
> 🔗 **GitHub Topics**: [`#frontend-architecture`](https://github.com/orgs/skill-step-labs/repositories?q=topic:frontend-architecture) [`#vite`](https://github.com/orgs/skill-step-labs/repositories?q=topic:vite) [`#webpack`](https://github.com/orgs/skill-step-labs/repositories?q=topic:webpack) [`#chartjs`](https://github.com/orgs/skill-step-labs/repositories?q=topic:chartjs) [`#d3js`](https://github.com/orgs/skill-step-labs/repositories?q=topic:d3js) [`#react-native-webview`](https://github.com/orgs/skill-step-labs/repositories?q=topic:react-native-webview) [`#pwa`](https://github.com/orgs/skill-step-labs/repositories?q=topic:pwa) [`#app-store`](https://github.com/orgs/skill-step-labs/repositories?q=topic:app-store)

---

## 📌 1. 프로젝트 개요 (Overview)

본 레포지거리는 **웹 애플리케이션의 번들 용량 및 초기 로딩 속도 최적화(FCP/LCP), 차트 시각화 렌더링 성능 차이, 모바일 웹 대 하이브리드 앱 통신 프로토콜, iOS/Android 앱스토어 배포 및 OTA(CodePush)**까지 웹과 모바일 영역 전반의 핵심 성능 및 빌드 아키텍처를 실습할 수 있도록 구성되었습니다.

---

## 🛠️ 2. 기술 스택 & 핵심 아키텍처 (Tech Stack)

| 구 분 | 기술 스택 / 패턴 | 주요 용도 |
| :--- | :--- | :--- |
| **Bundler & Build** | Vite v6, Rollup, esbuild, React 19, TypeScript | On-Demand ESM 번들링, 청크 분할 및 초고속 빌드 |
| **Visualization** | Chart.js (Canvas API), D3.js (SVG Layout Engine) | 캔버스 비트맵 렌더링 대 SVG DOM 렌더링 성능 비교 |
| **Mobile Bridge** | `window.ReactNativeWebView.postMessage`, Custom Event | 비동기 RPC 패턴 기반 웹 ↔ 네이티브 양방향 통신 |
| **PWA & Deploy** | Service Worker, App Store Connect, Play Console | Cache-First/Network-First 및 Fastlane, CodePush OTA |

---

## 💡 3. 핵심 학습 모듈 (Key Learning Modules)

### 1) [Vite vs Webpack 빌드 최적화 (`vite.config.ts`)](file:///Users/dobedub/Documents/source/lab/frontend-performance-lab/vite.config.ts)
- **위치**: `vite.config.ts`
- **핵심**: esbuild 사전 번들링(Pre-bundling), Rollup `manualChunks` (`react-vendor` 분할), Tree Shaking (`sideEffects: false`).

### 2) [React Native WebView RPC 양방향 브릿지 (`webViewBridge.ts`)](file:///Users/dobedub/Documents/source/lab/frontend-performance-lab/src/mobile-bridge/services/webViewBridge.ts)
- **위치**: `src/mobile-bridge/services/webViewBridge.ts`, `model/bridgeTypes.ts`
- **핵심**: 단방향 `postMessage`의 한계를 극복하는 `Promise` (Pending Map) 비동기 RPC 패턴, 네이티브 GPS/카메라/생체인증 시뮬레이터.

### 3) [Canvas vs SVG 시각화 최적화 (Chart.js / D3)](file:///Users/dobedub/Documents/source/lab/frontend-performance-lab/src/components/ChartJsExample.tsx)
- **위치**: `src/components/ChartJsExample.tsx`, `D3Example.tsx`
- **핵심**: Chart.js 비트맵 메모이제이션(`useMemo`) 대 D3.js 수학적 연산기 분리 렌더링.

### 4) [iOS / Android 앱스토어 배포 & OTA 체크리스트 (`appStoreDeploymentGuide.ts`)](file:///Users/dobedub/Documents/source/lab/frontend-performance-lab/src/mobile-bridge/services/appStoreDeploymentGuide.ts)
- **위치**: `src/mobile-bridge/services/appStoreDeploymentGuide.ts`, `components/MobileBuildStudio.tsx`
- **핵심**: iOS Provisioning Profile, Android AAB Dynamic Delivery, Fastlane 및 Apple Guideline 3.3.2 준수 CodePush.

---

## 🎯 4. 시니어 기술 면접 대비 Q&A (Senior Deep-Dive)

<details>
<summary><strong>Q1. Vite가 개발 서버 구동 속도에서 Webpack보다 압도적으로 빠른 이유는?</strong></summary>

> **A1.** Webpack은 개발 시 전체 소스의 의존성 그래프를 메모리에 번들링하여 시작하지만, Vite는 esbuild(Go 기반)로 node_modules만 사전 번들링하고 개발 소스는 브라우저의 Native ES Modules(ESM) 요청에 맞춰 On-Demand로 전달하기 때문에 프로젝트 크기와 상관없이 ms 단위로 시작됩니다.
</details>

<details>
<summary><strong>Q2. React Native WebView와 웹 간 비동기 RPC 브릿지 통신 설계 방법은?</strong></summary>

> **A2.** 단방향 `postMessage` 이벤트 통신에 요청 고유 `id`를 부여하고 `Promise` Map 객체에 `resolve/reject` 함수를 유지합니다. 네이티브가 처리를 마친 커스텀 이벤트를 웹에 주입할 때 해당 `id`를 찾아 비동기로 resolve시키는 RPC 패턴을 적용하여 async/await 사용을 가능케 합니다.
</details>

<details>
<summary><strong>Q3. iOS App Store 배포 시 Provisioning Profile과 Android AAB의 차이는?</strong></summary>

> **A3.** iOS Provisioning Profile은 "누가(Certificate) + 무슨 앱(App ID) + 어느 기기(UDID)"를 묶어 애플이 서명한 허가증입니다. Android AAB(App Bundle)는 단일 APK와 달리 구글 서버가 유저 기기 사양(칩셋, 언어)에 딱 맞는 맞춤형 APK(Dynamic Delivery)만 조합해 서빙하므로 용량을 40% 이상 절감합니다.
</details>

<details>
<summary><strong>Q4. OTA (CodePush) 핫픽스 배포 시 Apple 지침 준수 주의사항은?</strong></summary>

> **A4.** Apple Guideline 3.3.2에 따라 버그 수정, 텍스트 오타, 소규모 UI 변경은 OTA 즉시 배포가 허용되지만, 앱의 주요 목적(Primary Purpose)이 변경되거나 네이티브 API 권한을 무단 추가하는 중대 변경을 OTA로 우회하면 앱 삭제 및 개발자 계정이 정지됩니다.
</details>

---

## 🏃 5. 로컬 실행 방법 (How to Run)

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행 (포트 5173 / 3000)
npm run dev

# 3. 프로덕션 빌드 & 청크 확인
npm run build
```

---

## 🗺️ 6. Skill Step Labs 성격별 카테고리 로드맵

### 🎨 1. Frontend & Mobile Web Architecture ([`#frontend-architecture`](https://github.com/orgs/skill-step-labs/repositories?q=topic:frontend-architecture))
- [b2b-mes-admin-lab](https://github.com/skill-step-labs/b2b-mes-admin-lab): FSD Architecture, AG-Grid/Handsontable, MFE, BFF, State Studio
- [frontend-performance-lab](https://github.com/skill-step-labs/frontend-performance-lab): Vite/Webpack, Canvas/SVG, RN WebView Bridge, PWA, App Store
- [frontend-coding-interview-lab](https://github.com/skill-step-labs/frontend-coding-interview-lab): FE 알고리즘 & 바닐라 JS/React 하드코딩
- [frontend-security-lab](https://github.com/skill-step-labs/frontend-security-lab): XSS/CSRF 방어, CSP, SameSite Cookie, CORS

### ⚡ 2. Fullstack & Backend Performance ([`#backend-performance`](https://github.com/orgs/skill-step-labs/repositories?q=topic:backend-performance))
- [fullstack-reliability-lab](https://github.com/skill-step-labs/fullstack-reliability-lab): 멱등성, 낙관적 락, 지수 백오프 & 서킷 브레이커
- [backend-performance-lab](https://github.com/skill-step-labs/backend-performance-lab): FastAPI, Connection Pooling, Redis Cache, N+1 Query

### 🐳 3. Infrastructure & DevOps ([`#infra-devops`](https://github.com/orgs/skill-step-labs/repositories?q=topic:infra-devops))
- [docker-infra-lab](https://github.com/skill-step-labs/docker-infra-lab): Multi-stage Docker, Compose, Nginx Proxy, CI/CD

### 🧠 4. AI Engineering & Data Platform ([`#ai-data-platform`](https://github.com/orgs/skill-step-labs/repositories?q=topic:ai-data-platform))
- [llm-rag-data-platform-lab](https://github.com/skill-step-labs/llm-rag-data-platform-lab): RAG, ChromaDB/FAISS Vector Store, AWS Bedrock
- [ai-product-patterns-lab](https://github.com/skill-step-labs/ai-product-patterns-lab): SSE Streaming, AI Fallback Router, Rate Limiter

### 📱 5. Mobile Native Architecture ([`#mobile-native`](https://github.com/orgs/skill-step-labs/repositories?q=topic:mobile-native))
- [android-architecture-lab](https://github.com/skill-step-labs/android-architecture-lab): Clean Architecture, MVI, Compose, Coroutines/StateFlow

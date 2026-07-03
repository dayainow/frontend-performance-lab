# Frontend Performance Lab

프론트엔드 실무에서 자주 마주치는 성능 상황을 직접 재현하고 측정하는 React 실험 레포입니다.

## 가능한 실험 시나리오

| 시나리오 | 설명 | 주요 검증 포인트 |
| --- | --- | --- |
| **리렌더링 최적화** | `React.memo`, `useMemo`, `useCallback`, functional setState를 적용하기 전후를 비교합니다. | 부모 state 변경, 행 선택, render count, Profiler commit duration |
| **데이터 시각화 대시보드** | Recharts 기반 차트, KPI, 실시간 데이터 feed, 검색/필터 UI를 한 화면에서 재현합니다. | AreaChart, BarChart, live update 토글, KPI/차트 동기화 |
| **대용량 데이터 테이블** | 수천 건 고객 데이터와 백만 건 이상 보안 로그를 가상 스크롤 방식으로 렌더링합니다. | visible row 제한, 스크롤 성능, 필터 결과 반영 |
| **보안 관제 / SIEM** | SOC 대시보드, 로그 쿼리 빌더, 위협 타임라인, 지리/3D 토폴로지 시각화를 재현합니다. | Severity/Source/Time/MITRE 필터, Query builder, SIEM 로그 탐색 |
| **고급 시각화** | Three.js 3D 네트워크 토폴로지, 지리 위협 맵, 커스텀 그래프를 구성합니다. | 3D 렌더링, 회전 애니메이션, 국가별 threat point, severity graph |
| **이미지 로딩 최적화** | eager loading, native `loading="lazy"`, Intersection Observer 방식의 로딩 시점을 비교합니다. | Loaded/Skeletons 카운트, 스크롤 전후 요청 시점 |
| **코드 스플리팅** | `React.lazy`와 `Suspense`로 무거운 리포트 화면을 필요한 순간에만 불러옵니다. | lazy chunk 분리, 버튼 클릭 후 chunk 로드, fallback UI |
| **상태 전파 최적화** | 단일 Context와 분리된 Context가 소비자 컴포넌트 리렌더링에 주는 차이를 관찰합니다. | Single/Split Context, cart 변경, consumer render count |

## 테스트 가능 목록

### 리렌더링

- `Baseline` / `Optimized` 모드를 전환합니다.
- `부모 state만 변경` 버튼을 반복 클릭해서 `Parent updates`, `List commits`, `Last duration` 값을 비교합니다.
- 행을 선택했을 때 Baseline에서는 여러 행의 `render` 카운트가 늘고, Optimized에서는 선택 영향이 좁아지는지 확인합니다.
- 검색어, Plan, Health 필터를 바꿔 KPI와 차트, 가상 테이블 결과가 함께 바뀌는지 확인합니다.
- `실시간 업데이트 중지/시작` 버튼으로 live operations feed가 멈추고 다시 움직이는지 확인합니다.
- 대용량 테이블을 스크롤하면서 전체 row 수 대비 화면에 렌더링되는 row 수가 제한되는지 확인합니다.

### 보안 관제 / SIEM

- `보안 관제` 탭에서 Indexed logs, Filtered logs, Open incidents, Avg risk KPI를 확인합니다.
- Log query에 `asset`, `user`, `KR`, `Execution` 같은 값을 입력하고 Query builder 문장이 갱신되는지 확인합니다.
- Severity, Source, Time, MITRE tactic 필터를 변경해 KPI, 타임라인, 지리 맵, severity 그래프, 로그 테이블이 함께 바뀌는지 확인합니다.
- Three.js 3D network topology가 렌더링되고 회전 애니메이션이 동작하는지 확인합니다.
- Geo threat map에서 국가별 위험 점이 표시되는지 확인합니다.
- Optimized SIEM log table을 스크롤하면서 100만 건 이상 로그 규모에서도 visible row만 렌더링되는지 확인합니다.

### 이미지 로딩

- `Eager`, `Native`, `Observer` 모드를 전환합니다.
- Loaded와 Skeletons 카운트가 모드 전환 및 스크롤에 따라 바뀌는지 확인합니다.
- Observer 모드에서 화면 근처로 스크롤하기 전에는 스켈레톤이 유지되고, 진입 후 이미지가 로드되는지 확인합니다.
- DevTools Network 탭을 열어 실제 이미지 요청 시점 차이를 관찰합니다.

### 코드 스플리팅

- 첫 화면에서 HeavyReport UI가 보이지 않는지 확인합니다.
- `무거운 리포트 로드` 버튼을 눌렀을 때 Suspense fallback 뒤에 리포트가 나타나는지 확인합니다.
- 버튼을 다시 눌러 리포트가 닫히는지 확인합니다.
- `npm run build` 결과에서 `HeavyReport` 청크가 별도로 생성되는지 확인합니다.

### 상태 전파

- `Single` / `Split` 모드를 전환합니다.
- `장바구니 수량 변경` 버튼을 반복 클릭합니다.
- Single Context에서는 cart 변경 시 User, Filter, Cart 카드의 render count가 함께 증가하는지 확인합니다.
- Split Context에서는 Cart 카드 중심으로 render count가 증가하고 User/Filter 영향이 줄어드는지 확인합니다.

## 면접 설명 포인트

### React.lazy로 별도 chunk 분리

`React.lazy`는 컴포넌트를 처음부터 메인 JavaScript 번들에 포함하지 않고, 필요한 순간에 동적으로 불러오게 만드는 기능입니다. Vite/Rollup 같은 번들러는 `import("./HeavyReport")`, `import("./RenderingCharts")`처럼 동적 import를 만나면 해당 모듈과 의존성을 별도 파일로 분리합니다. 이 별도 파일을 보통 lazy chunk라고 부릅니다.

이 레포에서는 아래처럼 무거운 화면이나 라이브러리 의존성이 큰 기능을 lazy chunk로 분리합니다.

```tsx
const HeavyReport = lazy(() => import("./HeavyReport"));
const DashboardCharts = lazy(() => import("./RenderingCharts"));
const SecurityTopology3D = lazy(() => import("./SecurityTopology3D"));
```

그리고 실제 렌더링 위치에서는 `Suspense`로 로딩 중 UI를 감쌉니다.

```tsx
<Suspense fallback={<div>Loading report...</div>}>
  <HeavyReport />
</Suspense>
```

이렇게 하면 첫 화면을 열 때는 리포트, Recharts 차트, Three.js 토폴로지 코드를 모두 받지 않습니다. 사용자가 해당 탭이나 기능을 실제로 열 때 필요한 chunk만 추가로 요청합니다. 그래서 초기 로딩 비용을 줄이고, 첫 화면에서 꼭 필요한 코드만 먼저 실행할 수 있습니다.

빌드 결과에서도 분리 여부를 확인할 수 있습니다.

```text
dist/assets/HeavyReport-*.js
dist/assets/RenderingCharts-*.js
dist/assets/SecurityTopology3D-*.js
```

면접에서는 이렇게 설명하면 좋습니다.

> 차트 라이브러리나 3D 시각화처럼 번들 크기가 큰 기능은 첫 화면에 항상 필요하지 않습니다. 그래서 `React.lazy`와 동적 import로 별도 chunk로 분리했고, `Suspense` fallback을 붙여 필요한 시점에만 로드되도록 했습니다. 빌드 결과에서 `RenderingCharts`, `SecurityTopology3D`, `HeavyReport`가 별도 asset으로 생성되는 것을 확인했습니다. 이 방식은 초기 번들 크기를 줄이는 데 유리하지만, 사용자가 기능을 처음 열 때 추가 네트워크 요청이 생기므로 fallback UI와 적절한 분리 기준이 중요합니다.

확인할 때는 DevTools Network 탭을 열고 첫 화면에서 해당 chunk가 요청되지 않는지, 버튼 클릭이나 탭 진입 후 chunk가 요청되는지 보면 됩니다.

## 확인 포인트 기록 방식

면접 답변에 쓸 만한 포인트를 확인할 때마다 아래 순서로 기록합니다.

1. `README.md`의 테스트 가능 목록이나 면접 설명 포인트에 요약을 추가합니다.
2. 실제 측정값이 있으면 `docs/measurements.md`에 날짜, 시나리오, 관찰값, 해석을 남깁니다.
3. `npm test`와 필요한 경우 `npm run build`로 검증합니다.
4. 변경 내용을 커밋하고 `origin/main`에 푸쉬합니다.

## 실행

```bash
npm install
npm run dev
```

빌드와 테스트:

```bash
npm run build
npm test
```

## 측정 방법

1. Chrome DevTools Performance 또는 React DevTools Profiler를 엽니다.
2. 각 시나리오에서 모드, 필터, 버튼, 스크롤을 바꿔가며 재현합니다.
3. 렌더링 횟수, commit duration, 이미지 요청 시점, lazy chunk 로딩 여부, 로그 테이블 visible row 수를 기록합니다.
4. `docs/measurements.md`에 문제 상황, 개선 방법, 측정 결과, 배운 점을 남깁니다.

## 주의

개발 모드에서 React StrictMode를 켜면 렌더링 카운트가 의도적으로 더 많이 보일 수 있습니다. 이 레포는 실험값을 읽기 쉽게 하기 위해 기본 진입점에서 StrictMode를 사용하지 않습니다.

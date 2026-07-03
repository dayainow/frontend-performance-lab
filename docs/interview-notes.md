# Interview Notes

면접에서 실험 의도와 구현 근거를 설명할 때 쓰는 메모입니다. 확인한 포인트는 이 문서에 계속 누적합니다.

## React.lazy / 별도 chunk 분리

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

## 대용량 데이터 테이블 / 가상 스크롤

대용량 데이터 테이블 실험은 수천 건 고객 데이터와 125만 건 규모의 보안 로그를 한 번에 DOM에 렌더링하지 않고, 현재 화면에 보이는 행만 계산해서 렌더링하는 방식입니다. 이 패턴을 가상 스크롤 또는 windowing이라고 부릅니다.

일반적인 테이블에서 10만 건, 100만 건 데이터를 모두 `map`으로 렌더링하면 브라우저 DOM 노드가 폭증합니다. 그러면 초기 렌더링, 스크롤, 레이아웃 계산, 스타일 계산 비용이 모두 커집니다. 그래서 이 레포에서는 전체 row 수는 유지하되, 실제 DOM에는 viewport 주변의 작은 window만 올립니다.

핵심 계산은 아래 흐름입니다.

```tsx
const totalHeight = records.length * rowHeight;
const startIndex = Math.floor(scrollTop / rowHeight) - overscan;
const endIndex = Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan;
const visibleRows = records.slice(startIndex, endIndex);
```

`totalHeight`는 스크롤바가 전체 데이터가 있는 것처럼 동작하게 만드는 값입니다. `startIndex`와 `endIndex`는 현재 스크롤 위치에서 실제로 렌더링할 행 범위입니다. `overscan`은 화면 바로 위아래 행을 조금 더 렌더링해서 빠르게 스크롤할 때 빈 화면이 보이지 않도록 하는 완충 영역입니다.

렌더링할 행은 절대 위치 또는 transform으로 원래 있어야 할 위치에 배치합니다.

```tsx
style={{ transform: `translateY(${top}px)` }}
```

이렇게 하면 사용자는 전체 테이블을 스크롤하는 것처럼 느끼지만, 브라우저는 매 순간 수십 개 정도의 row만 관리합니다.

이 레포에서는 두 군데에서 확인할 수 있습니다.

- `RenderingLab`: 고객 분석 테이블에서 수천 건 데이터를 필터링하고 `rendering N visible rows`를 표시합니다.
- `SecurityOpsLab`: `totalIndexedLogs = 1_250_000`으로 백만 건 이상 SIEM 로그 규모를 만들고, 필터 결과에 맞는 row 수와 실제 visible row 수를 분리해서 보여줍니다.

필터가 바뀔 때는 전체 데이터를 다시 DOM에 뿌리는 것이 아니라, 조건에 맞는 row count와 현재 window를 다시 계산합니다. 보안 로그 테이블은 모든 로그 객체를 미리 125만 개 생성하지 않고, 현재 보이는 index 범위에 대해서만 deterministic하게 row 데이터를 만들어냅니다. 그래서 대용량 데이터처럼 보이면서도 메모리 사용량을 작게 유지할 수 있습니다.

면접에서는 이렇게 설명하면 좋습니다.

> 대용량 테이블은 전체 데이터를 DOM에 모두 렌더링하지 않고 가상 스크롤 방식으로 구현했습니다. 전체 row 수에 맞는 spacer height를 만들어 스크롤바는 정상적으로 보이게 하고, 실제 DOM에는 `scrollTop`, `rowHeight`, `viewportHeight`로 계산한 visible range와 overscan 영역만 렌더링했습니다. 보안 로그 쪽은 125만 건 규모를 가정하되 모든 객체를 메모리에 생성하지 않고 현재 보이는 index 범위만 row 데이터로 생성했습니다. 그래서 필터 결과의 전체 개수는 유지하면서도 브라우저가 관리하는 DOM 노드는 수십 개 수준으로 제한했습니다.

확인할 때는 테이블 상단의 `rendering N visible rows` 문구를 보면 됩니다. 전체 matching rows가 수천 건 또는 백만 건 이상이어도 visible rows 숫자는 제한되어 있어야 합니다. 스크롤해도 DOM row 수가 폭증하지 않고, 필터를 바꾸면 전체 row count와 visible row가 함께 갱신되는지도 확인 포인트입니다.

## 보안 관제 / SIEM 대시보드

보안 관제 / SIEM 실험은 SOC 운영자가 이벤트를 탐색하는 화면을 가정하고 만든 워크벤치입니다. 한 화면 안에서 로그 쿼리 빌더, 심각도/소스/시간/MITRE tactic 필터, KPI, 위협 타임라인, 지리 기반 threat map, severity graph, 3D 네트워크 토폴로지, 가상화 로그 테이블을 함께 확인할 수 있습니다.

이 실험의 핵심은 모든 UI가 하나의 필터 상태에서 파생된다는 점입니다.

```tsx
const [filters, setFilters] = useState<SecurityFilters>({
  query: "",
  severity: "all",
  source: "all",
  timeRange: "24h",
  tactic: "all",
});
```

이 `filters` 값이 바뀌면 아래 데이터가 함께 다시 계산됩니다.

```tsx
const filteredLogCount = useMemo(() => estimateLogCount(deferredFilters), [deferredFilters]);
const summary = useMemo(() => buildSecuritySummary(deferredFilters), [deferredFilters]);
const timeline = useMemo(() => buildTimelineData(deferredFilters), [deferredFilters]);
const geoEvents = useMemo(() => buildGeoEvents(deferredFilters), [deferredFilters]);
const severityMix = useMemo(() => buildSeverityMix(deferredFilters), [deferredFilters]);
```

즉, 사용자가 Severity를 `critical`로 바꾸거나 Source를 `identity`로 바꾸면 KPI, 타임라인, 지리 맵, severity graph, 로그 테이블이 같은 조건을 기준으로 갱신됩니다. 실무 대시보드에서는 각 위젯이 서로 다른 조건을 보고 있으면 데이터 신뢰도가 떨어지기 때문에, 필터 상태를 단일 출처로 두고 파생 데이터를 만드는 구조가 중요합니다.

쿼리 빌더는 현재 필터 상태를 사람이 읽을 수 있는 SIEM 검색 조건처럼 보여줍니다.

```tsx
text:admin AND severity:critical AND source:identity AND tactic:"Initial Access" AND range:24h
```

이 기능은 실제 검색 엔진을 붙인 것은 아니지만, 보안 제품 UI에서 흔히 쓰는 쿼리 작성 경험을 재현합니다. 사용자는 검색어, 심각도, 로그 소스, 시간 범위, MITRE tactic을 조합하면서 현재 탐색 조건을 명확히 볼 수 있습니다.

시각화는 보안 관제에서 자주 보는 관점을 나눠서 구성했습니다.

- KPI: indexed logs, filtered logs, open incidents, average risk를 요약합니다.
- Threat timeline: 시간대별 critical/high 이벤트 추이를 막대 형태로 보여줍니다.
- Geo threat map: 국가별 위협 지점을 지도 형태로 표시합니다.
- Severity graph: critical/high/medium/low 분포를 커스텀 막대 그래프로 보여줍니다.
- 3D network topology: SOC, EDR, firewall, IAM, cloud, DB 같은 노드를 Three.js로 연결해 관제 토폴로지를 표현합니다.
- Optimized SIEM log table: 125만 건 규모의 로그를 가상 스크롤로 탐색합니다.

3D 토폴로지는 `React.lazy`로 분리한 `SecurityTopology3D`에서 Three.js를 사용합니다. `riskLevel`에 따라 중심 SOC 노드 색이 바뀌고, 노드가 회전/펄스 애니메이션을 가집니다. 또한 cleanup에서 animation frame, resize observer, renderer, geometry/material을 정리해서 WebGL 리소스가 남지 않도록 했습니다.

```tsx
return () => {
  window.cancelAnimationFrame(animationFrame);
  resizeObserver.disconnect();
  renderer.dispose();
  mesh.geometry.dispose();
  material.dispose();
};
```

로그 테이블은 SIEM 도메인에서 특히 중요합니다. 보안 이벤트는 양이 많기 때문에 전체 로그를 모두 DOM에 올리지 않고, 필터 결과 row count와 현재 visible rows를 분리했습니다. `totalIndexedLogs = 1_250_000`으로 대규모 인덱스를 가정하고, 현재 보이는 범위만 `buildSecurityLog`로 생성합니다.

면접에서는 이렇게 설명하면 좋습니다.

> 보안 관제 / SIEM 시나리오는 SOC 운영자가 이벤트를 탐색하는 화면을 가정해 만들었습니다. 검색어, severity, source, time range, MITRE tactic을 하나의 filter state로 관리하고, 이 상태에서 KPI, 쿼리 빌더, 위협 타임라인, 지리 맵, severity graph, 로그 테이블을 모두 파생시켰습니다. 그래서 필터를 바꾸면 모든 위젯이 같은 조건으로 동기화됩니다. 또한 125만 건 규모의 로그를 가정해 가상 스크롤 테이블을 구현했고, Three.js 기반 3D 네트워크 토폴로지는 lazy chunk로 분리해 초기 로딩 비용을 줄였습니다.

확인할 때는 `보안 관제` 탭에서 Log query, Severity, Source, Time, MITRE tactic을 바꿔보면 됩니다. Query builder 문장과 KPI가 바뀌고, 타임라인/맵/그래프/로그 테이블이 같은 조건으로 갱신되면 의도한 흐름이 보이는 것입니다. 3D topology가 회전하고 risk 수준에 따라 중심 노드 색이 달라지는지도 확인 포인트입니다.

## 고급 시각화 / Three.js, 지리 맵, 커스텀 그래프

고급 시각화 실험은 보안 관제 데이터를 단순 표로만 보여주지 않고, 상황을 빠르게 이해할 수 있도록 여러 시각화 방식을 조합한 것입니다. 이 레포에서는 Three.js 3D 네트워크 토폴로지, SVG 기반 지리 위협 맵, DOM/CSS 기반 커스텀 그래프를 함께 구성했습니다.

시각화별 역할은 다릅니다.

- 3D network topology: 시스템과 보안 구성 요소의 연결 관계를 보여줍니다.
- Geo threat map: 국가별 위협 발생 위치와 위험도를 보여줍니다.
- Threat timeline: 시간대별 critical/high 이벤트 흐름을 보여줍니다.
- Severity graph: 심각도별 이벤트 분포를 비교합니다.

3D 토폴로지는 Three.js를 사용했습니다. `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `Mesh`, `Line`을 만들고, SOC를 중심 노드로 둔 뒤 EDR, firewall, IAM, cloud, DB 같은 노드를 3D 공간에 배치했습니다.

```tsx
const scene = new Scene();
const camera = new PerspectiveCamera(42, 1, 0.1, 100);
const renderer = new WebGLRenderer({ antialias: true });
```

각 노드는 sphere mesh로 만들고, SOC 중심 노드와 주변 노드를 line으로 연결했습니다. `riskLevel`에 따라 SOC 노드 색을 초록/주황/빨강으로 바꿔 현재 위험 수준을 직관적으로 보여줍니다.

```tsx
const riskColor = riskLevel > 72 ? "#dc2626" : riskLevel > 58 ? "#f97316" : "#0f766e";
```

애니메이션은 `requestAnimationFrame`으로 group을 회전시키고, 각 노드에 작은 pulse scale을 줍니다.

```tsx
group.rotation.y += 0.006;
mesh.scale.setScalar(1 + pulse);
```

Three.js는 WebGL 리소스를 직접 사용하므로 cleanup이 중요합니다. 컴포넌트가 사라질 때 animation frame, resize observer, renderer, geometry, material을 정리했습니다.

```tsx
window.cancelAnimationFrame(animationFrame);
resizeObserver.disconnect();
renderer.dispose();
mesh.geometry.dispose();
material.dispose();
```

지리 위협 맵은 SVG로 구현했습니다. 실제 지도 라이브러리를 붙이지 않고, 가벼운 `viewBox`, `path`, `circle`, `text` 조합으로 국가별 threat point를 표현했습니다. 이벤트의 `risk`가 높을수록 원의 크기와 색이 더 강하게 보입니다.

```tsx
<circle r={12 + event.risk / 10} fill="rgba(220, 38, 38, 0.15)" />
<circle r="5" fill={event.risk > 72 ? "#dc2626" : "#f59e0b"} />
```

커스텀 그래프는 라이브러리 없이 DOM과 CSS로 구성했습니다. Threat timeline은 시간대별 막대 높이를 직접 계산하고, Severity graph는 심각도별 비율을 width로 표현합니다. 이렇게 한 이유는 단순 막대 그래프나 작은 운영 위젯은 무거운 차트 라이브러리 없이도 충분히 구현할 수 있기 때문입니다.

```tsx
<i style={{ width: `${(item.value / maxValue) * 100}%`, background: item.color }} />
```

면접에서는 이렇게 설명하면 좋습니다.

> 고급 시각화는 데이터의 성격에 따라 다른 방식으로 구현했습니다. 네트워크 연결 관계는 Three.js로 3D 토폴로지를 만들고, 국가별 이벤트는 SVG 기반 지리 맵으로 표시했습니다. 시간대별 이벤트와 severity 분포는 라이브러리 없이 DOM/CSS 기반 커스텀 그래프로 구현했습니다. Three.js는 WebGL 리소스를 사용하기 때문에 renderer, geometry, material, animation frame cleanup을 신경 썼고, 번들 크기를 고려해 lazy chunk로 분리했습니다. 단순 그래프는 별도 라이브러리를 쓰지 않아 불필요한 번들 증가를 피했습니다.

확인할 때는 `보안 관제` 탭에서 필터를 바꿔보면 됩니다. Avg risk가 달라지면 3D 토폴로지 중심 노드 색이 바뀌고, Geo threat map의 국가별 point와 Severity graph의 막대 값도 함께 갱신됩니다. 이 흐름이 보이면 고급 시각화가 단순 장식이 아니라 필터 상태와 연결된 데이터 시각화라는 점을 설명할 수 있습니다.

## 이미지 로딩 최적화 / eager, native lazy, Intersection Observer

이미지 로딩 최적화 실험은 많은 이미지 카드가 있는 화면에서 이미지 요청 시점을 어떻게 제어하는지 비교하는 실험입니다. 이 레포에서는 `Eager`, `Native`, `Observer` 세 가지 모드를 제공합니다.

- Eager: 이미지가 렌더링되는 즉시 `src`를 넣고 바로 로드합니다.
- Native: 브라우저 기본 lazy loading인 `loading="lazy"`를 사용합니다.
- Observer: `IntersectionObserver`로 화면 근처에 들어오기 전까지 `src` 자체를 넣지 않습니다.

핵심 차이는 `img` 태그가 언제 만들어지고, `src`가 언제 들어가느냐입니다.

```tsx
{visible && (
  <img
    src={image.src}
    loading={mode === "native" ? "lazy" : "eager"}
    decoding="async"
    onLoad={() => onLoad(image.id)}
  />
)}
```

`Eager` 모드에서는 `visible`이 처음부터 true라서 모든 이미지에 바로 `src`가 들어갑니다. 따라서 초기 렌더링 시점에 이미지 요청이 많이 발생할 수 있습니다. 상품 목록이나 갤러리처럼 이미지가 많으면 초기 네트워크 비용이 커질 수 있습니다.

`Native` 모드에서는 `img` 태그와 `src`는 렌더링하지만, 브라우저에게 `loading="lazy"` 힌트를 줍니다. 실제 로딩 시점은 브라우저가 viewport, 네트워크 상태, 우선순위 등을 고려해 결정합니다. 구현은 가장 간단하지만, 정확히 언제 요청할지 세밀하게 제어하기는 어렵습니다.

`Observer` 모드에서는 화면 근처에 들어오기 전까지 `img`를 렌더링하지 않고 skeleton만 보여줍니다.

```tsx
const [visible, setVisible] = useState(mode !== "observer");
```

그리고 `IntersectionObserver`가 카드가 viewport 근처에 들어온 것을 감지하면 `visible`을 true로 바꿉니다.

```tsx
const observer = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      callback();
      observer.disconnect();
    }
  },
  { rootMargin: "220px" },
);
```

`rootMargin: "220px"`은 실제로 화면에 딱 들어오기 전에 미리 로드하겠다는 의미입니다. 이렇게 하면 사용자가 스크롤할 때 이미지가 보이기 직전에 요청을 시작해서, skeleton이 오래 보이는 문제를 줄일 수 있습니다.

이 실험에서는 `Loaded`와 `Skeletons` 카운트로 로딩 상태를 확인합니다.

```tsx
const [loadedIds, setLoadedIds] = useState<Set<number>>(() => new Set());
const loadedCount = loadedIds.size;
```

이미지가 로드되면 `onLoad`에서 id를 Set에 기록합니다. Set을 쓰는 이유는 같은 이미지의 load 이벤트가 중복으로 들어와도 카운트를 한 번만 올리기 위해서입니다.

```tsx
if (current.has(id)) return current;
const next = new Set(current);
next.add(id);
return next;
```

모드를 바꿀 때는 `loadedIds`를 초기화해서 각 로딩 방식의 결과를 새로 비교할 수 있게 했습니다.

```tsx
setMode(nextMode);
setLoadedIds(new Set());
```

면접에서는 이렇게 설명하면 좋습니다.

> 이미지 로딩 최적화 실험에서는 많은 이미지 카드가 있는 화면을 만들고 eager, native lazy, Intersection Observer 방식을 비교했습니다. Eager는 모든 이미지에 즉시 `src`를 넣기 때문에 초기 요청이 많아질 수 있고, native lazy는 `loading="lazy"`로 브라우저에게 로딩 시점을 맡기는 방식입니다. Observer 모드는 카드가 화면 근처에 들어오기 전까지 `src`를 넣지 않고 skeleton을 보여주다가, IntersectionObserver가 감지하면 이미지를 렌더링합니다. Loaded/Skeletons 카운트와 Network 탭을 통해 스크롤 전후 요청 시점 차이를 확인할 수 있습니다.

확인할 때는 `이미지 로딩` 탭에서 `Eager`, `Native`, `Observer` 모드를 바꿔보면 됩니다. Observer 모드에서는 스크롤 전에는 skeleton 수가 많고, 아래로 스크롤할수록 Loaded가 증가해야 합니다. 실제 CDN 이미지를 쓰면 DevTools Network 탭에서 초기 요청 수와 스크롤 후 요청 시점을 더 명확히 확인할 수 있습니다.

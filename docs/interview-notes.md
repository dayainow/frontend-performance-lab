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

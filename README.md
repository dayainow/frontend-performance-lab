# Frontend Performance Lab

프론트엔드 실무/면접에서 자주 나오는 성능 상황을 직접 재현하고 측정하는 React 실험 레포입니다.

## 실험 시나리오

- **리렌더링 최적화**: `React.memo`, `useMemo`, `useCallback`, functional setState를 적용하기 전후를 비교합니다.
- **이미지 로딩 최적화**: eager loading, native `loading="lazy"`, Intersection Observer 방식의 로딩 시점을 비교합니다.
- **코드 스플리팅**: `React.lazy`와 `Suspense`로 무거운 리포트 화면을 필요한 순간에만 불러옵니다.
- **상태 전파 최적화**: 단일 Context와 분리된 Context가 소비자 컴포넌트 리렌더링에 주는 차이를 관찰합니다.

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
2. 각 시나리오에서 Baseline과 Optimized를 번갈아 실행합니다.
3. 렌더링 횟수, commit duration, 이미지 요청 시점, lazy chunk 로딩 여부를 기록합니다.
4. `docs/measurements.md`에 문제 상황, 개선 방법, 측정 결과, 배운 점을 남깁니다.

## 면접 답변으로 바꾸는 방식

실험 결과를 다음 구조로 정리하면 좋습니다.

```md
문제 상황:
부모 state 변경 때문에 무거운 자식 리스트가 매번 리렌더링되었습니다.

적용한 방법:
React.memo로 행 컴포넌트를 감싸고, useCallback으로 props 함수 참조를 안정화했습니다.

측정 결과:
Profiler 기준 불필요한 행 렌더링이 줄었고 commit duration이 감소했습니다.

배운 점:
메모이제이션은 모든 컴포넌트에 적용하는 것이 아니라 렌더링 비용과 props 안정성이 중요한 곳에 선택적으로 적용해야 합니다.
```

## 주의

개발 모드에서 React StrictMode를 켜면 렌더링 카운트가 의도적으로 더 많이 보일 수 있습니다. 이 레포는 실험값을 읽기 쉽게 하기 위해 기본 진입점에서 StrictMode를 사용하지 않습니다.

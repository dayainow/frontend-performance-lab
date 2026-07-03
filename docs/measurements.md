# Measurements

실험할 때마다 아래 템플릿을 복사해서 기록하세요.

## 2026-07-02 / rendering

### 문제 상황

부모 컴포넌트의 상태만 변경했는데 리스트 행 전체가 다시 렌더링됨.

### 변경 전

- 모드:
- 렌더링 횟수:
- 마지막 commit duration:
- 관찰:

### 변경 후

- 모드:
- 렌더링 횟수:
- 마지막 commit duration:
- 관찰:

### 정리 메모

메모이제이션은 비용이 있는 컴포넌트나 참조 안정성이 필요한 props에 선택적으로 적용했다.

## 이미지 로딩 체크리스트

- eager 모드에서 초기 로드 이미지 수:
- native lazy 모드에서 스크롤 전/후 로드 수:
- observer 모드에서 스켈레톤 노출 상태:
- 실제 CDN 이미지로 바꿨을 때 Network waterfall:

## 코드 스플리팅 체크리스트

- `npm run build` 후 HeavyReport 청크가 분리되는지:
- 첫 화면에서 해당 청크가 요청되지 않는지:
- 버튼 클릭 후 청크가 요청되는지:
- `RenderingCharts` 청크가 Recharts 의존성과 함께 별도로 생성되는지:
- `SecurityTopology3D` 청크가 Three.js 의존성과 함께 별도로 생성되는지:
- lazy chunk 최초 로딩 중 fallback UI가 보이는지:

## 상태 전파 체크리스트

- Single Context에서 cart 변경 시 user/filter 소비자 render count:
- Split Context에서 cart 변경 시 user/filter 소비자 render count:

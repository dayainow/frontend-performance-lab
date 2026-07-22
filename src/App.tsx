import React from 'react';
import { ChartJsLine, ChartJsDoughnut } from './components/ChartJsExample';
import D3Example from './components/D3Example';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1 className="gradient-text">데이터 시각화 실무 면접 대비용 아키텍처 가이드</h1>
        <p>단순 구현을 넘어 렌더링 원리, 성능 최적화, 그리고 트레이드오프(Trade-off)를 설명할 수 있는 수준의 실무 지식</p>
      </header>

      {/* 1. Chart.js 섹션 */}
      <section className="section-split">
        <div className="info-side">
          <div className="info-card">
            <h3>📈 Chart.js: Canvas 렌더링과 최적화</h3>
            <p><strong>[면접관이 묻는다면?] "Chart.js를 선택한 이유와 내부 렌더링 방식은?"</strong></p>
            <p>Chart.js는 <strong>Canvas API(비트맵 렌더링)</strong>를 사용합니다. 수만 개의 데이터 포인트를 렌더링할 때 DOM 노드를 생성하지 않으므로 SVG 기반 라이브러리보다 메모리 사용량이 적고 성능이 우수합니다. 실무에서는 실시간 로그 모니터링처럼 데이터 양이 많고 빠른 렌더링이 필요할 때 도입합니다.</p>
            <p>또한, 최신 Chart.js는 <strong>Tree-shaking</strong>을 완벽히 지원합니다. 전체 라이브러리를 통째로 가져오지 않고, <code>ChartJS.register(LineElement, CategoryScale...)</code> 형태로 필요한 모듈만 번들링하여 초기 로딩 속도(Bundle Size)를 최적화했습니다.</p>
          </div>
          
          <div className="info-card">
            <h3>🍩 React와의 통합 (react-chartjs-2)</h3>
            <p><strong>[면접관이 묻는다면?] "React 환경에서 Chart.js를 사용할 때 주의할 점은?"</strong></p>
            <p>순수 Canvas 라이브러리인 Chart.js를 React의 선언적 UI와 맞추기 위해 <code>react-chartjs-2</code> 래퍼를 사용합니다. 이때 가장 중요한 실무 이슈는 <strong>'불필요한 리렌더링 방지'</strong>입니다.</p>
            <p>React 컴포넌트가 리렌더링될 때마다 차트 객체(옵션, 데이터)의 참조값(Reference)이 바뀌면 차트 전체가 파괴(Destroy)되고 다시 그려지는 성능 저하가 발생합니다. 따라서 실무에서는 차트에 주입되는 <code>data</code>와 <code>options</code> 객체를 반드시 <code>useMemo</code>로 감싸서 메모이제이션(Memoization) 처리해야 합니다.</p>
          </div>
        </div>

        <div className="chart-side">
          <div className="glass-panel">
            <h4 className="chart-box-title">Canvas 기반 렌더링 성능 최적화 (Line)</h4>
            <div className="chart-box" style={{ height: '300px' }}>
              <ChartJsLine />
            </div>
          </div>
          
          <div className="glass-panel">
            <h4 className="chart-box-title">트리쉐이킹(Tree-shaking) 모듈화 로딩 (Doughnut)</h4>
            <div className="chart-box" style={{ height: '300px' }}>
              <ChartJsDoughnut />
            </div>
          </div>
        </div>
      </section>

      {/* 2. D3.js 섹션 */}
      <section className="section-split">
        <div className="info-side">
          <div className="info-card purple">
            <h3>🎛️ D3.js: SVG 렌더링과 마이크로 컨트롤</h3>
            <p><strong>[면접관이 묻는다면?] "D3.js는 언제, 왜 사용하나요?"</strong></p>
            <p>D3.js는 <strong>SVG(벡터 렌더링)</strong> 기반으로 DOM 노드를 직접 조작합니다. 해상도에 상관없이 선명하며 CSS를 통한 스타일링과 접근성(Accessibility) 확보에 유리합니다. 기성 차트 라이브러리로는 구현 불가능한 '복잡한 인터랙션'이나 '완전히 커스텀된 데이터 시각화(네트워크 그래프, 지리 정보 등)'가 비즈니스 요구사항에 있을 때만 선택적으로 도입합니다. DOM 노드가 많아지면 성능이 급격히 저하되는 트레이드오프가 있습니다.</p>
          </div>

          <div className="info-card purple">
            <h3>⚔️ React Virtual DOM vs D3 DOM 조작</h3>
            <p><strong>[면접관이 묻는다면?] "React와 D3를 함께 쓸 때 렌더링 주도권 충돌은 어떻게 해결하나요?"</strong></p>
            <p>이것이 D3 실무의 핵심입니다. React도 DOM을 조작하고(Virtual DOM), D3도 DOM을 직접 조작하려 하기 때문에 충돌이 발생합니다. 실무에서는 크게 두 가지 패턴을 씁니다.</p>
            <p><strong>1. D3에게 수학(Math)만 맡기기:</strong> D3의 <code>scale</code>, <code>path</code> 제네레이터 같은 수학 연산 기능만 빌려 쓰고, 실제 SVG 요소(<code>&lt;rect&gt;</code>, <code>&lt;path&gt;</code>) 렌더링은 React가 담당하게 하는 패턴 (가장 권장됨).</p>
            <p><strong>2. React를 껍데기로 쓰기 (현재 예제):</strong> <code>useRef</code>를 이용해 빈 <code>&lt;svg&gt;</code> 태그만 렌더링한 후, <code>useEffect</code> 내부에서 D3가 그 내부 DOM을 완전히 장악하게(Enter-Update-Exit) 넘겨주는 패턴. 레거시 D3 코드를 포팅할 때 주로 씁니다.</p>
          </div>
        </div>

        <div className="chart-side">
          <div className="glass-panel" style={{ height: '100%' }}>
            <h4 className="chart-box-title">D3.js & React 렌더링 라이프사이클 통합 (Bar with Axis)</h4>
            <div className="chart-box" style={{ height: '500px' }}>
              <D3Example />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default App;

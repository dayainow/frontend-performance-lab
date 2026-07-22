import { useState } from "react";
import { ChartJsLine, ChartJsDoughnut } from "./components/ChartJsExample";
import D3Example from "./components/D3Example";
import { MobileBuildStudio } from "./components/MobileBuildStudio";

function App() {
  const [activeTab, setActiveTab] = useState<"visualization" | "mobile-build">("mobile-build");

  return (
    <div className="app-container">
      <header className="header flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="gradient-text text-2xl md:text-3xl font-extrabold">
            프론트엔드 성능 & 모바일/빌드 실무 랩
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Vite 번들링 최적화, PWA, React Native WebView Bridge 및 iOS/Android 앱스토어 배포 파이프라인 딥다이브
          </p>
        </div>

        {/* Top Level Tab Navigation */}
        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-white/10 shadow-lg shrink-0">
          <button
            onClick={() => setActiveTab("mobile-build")}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeTab === "mobile-build"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📱 Mobile / Build Studio
          </button>
          <button
            onClick={() => setActiveTab("visualization")}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeTab === "visualization"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📊 Chart & D3 Performance
          </button>
        </div>
      </header>

      {activeTab === "mobile-build" ? (
        <MobileBuildStudio />
      ) : (
        <div className="space-y-8">
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
              <div className="info-card">
                <h3>🎨 D3.js: SVG 커스텀 렌더링과 리액트 바인딩</h3>
                <p><strong>[면접관이 묻는다면?] "D3.js와 React의 상태(State) 주도권을 어떻게 조정하나요?"</strong></p>
                <p>D3.js는 원래 <strong>직접 DOM을 조작(Imperative DOM Control)</strong>하는 라이브러리인 반면, React는 <strong>Virtual DOM을 관리(Declarative UI)</strong>합니다. 이 둘이 충돌하지 않도록 실무에서는 D3를 <strong>'수학적 연산기(Math & Layout Generator)'</strong>로만 활용하고, 실제 SVG DOM 렌더링은 React 컴포넌트가 담당하도록 역할을 완전히 분리합니다.</p>
              </div>
            </div>

            <div className="chart-side">
              <div className="glass-panel">
                <h4 className="chart-box-title">D3 Math Generator + React SVG Binding</h4>
                <div className="chart-box" style={{ height: '350px' }}>
                  <D3Example />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;

import { lazy, Suspense, useState } from "react";
import { Metric } from "../../components/Metric";

const HeavyReport = lazy(() => import("./HeavyReport"));

export function CodeSplittingLab() {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="code-layout">
      <aside className="lab-panel">
        <button
          type="button"
          className="primary-action"
          onClick={() => setShowReport((visible) => !visible)}
        >
          {showReport ? "무거운 리포트 닫기" : "무거운 리포트 로드"}
        </button>

        <div className="metrics-grid">
          <Metric label="Initial route" value="light" tone="good" />
          <Metric label="Heavy chunk" value={showReport ? "loaded" : "deferred"} />
          <Metric label="Pattern" value="React.lazy" />
        </div>

        <div className="note">
          <strong>관찰 포인트</strong>
          <p>
            빌드 후 dist/assets를 보면 HeavyReport가 별도 청크로 분리됩니다.
            실무에서는 차트, 에디터, 지도처럼 첫 화면에 필요 없는 기능에
            적용하기 좋습니다.
          </p>
        </div>
      </aside>

      <section className="report-stage">
        {!showReport && (
          <div className="empty-state">
            <strong>아직 리포트 코드를 받지 않았습니다.</strong>
            <p>버튼을 눌러 lazy chunk가 필요한 순간에만 로드되는지 확인하세요.</p>
          </div>
        )}

        {showReport && (
          <Suspense fallback={<div className="report-skeleton">Loading report...</div>}>
            <HeavyReport />
          </Suspense>
        )}
      </section>
    </div>
  );
}

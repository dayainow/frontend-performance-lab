import { memo, Profiler, useCallback, useMemo, useRef, useState } from "react";
import { Metric } from "../../components/Metric";
import { SegmentedControl } from "../../components/SegmentedControl";
import {
  buildCustomerRecords,
  CustomerRecord,
  expensiveHealthScore,
} from "./rendering-utils";

type RenderMode = "baseline" | "optimized";

export function RenderingLab() {
  const [mode, setMode] = useState<RenderMode>("baseline");
  const [parentTicks, setParentTicks] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profileMetrics, setProfileMetrics] = useState({ commits: 0, lastCommit: 0 });
  const ignoreMetricsCommit = useRef(false);
  const records = useMemo(() => buildCustomerRecords(96), []);
  const visibleRecords = useMemo(() => records.slice(0, 42), [records]);

  const toggleSelected = useCallback((id: number) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  return (
    <div className="lab-grid">
      <aside className="lab-panel">
        <SegmentedControl
          label="실험 모드"
          value={mode}
          options={[
            { label: "Baseline", value: "baseline" },
            { label: "Optimized", value: "optimized" },
          ]}
          onChange={setMode}
        />

        <button
          type="button"
          className="primary-action"
          onClick={() => setParentTicks((tick) => tick + 1)}
        >
          부모 state만 변경
        </button>

        <div className="metrics-grid">
          <Metric label="Parent updates" value={parentTicks} />
          <Metric label="List commits" value={profileMetrics.commits} />
          <Metric label="Last duration" value={`${profileMetrics.lastCommit.toFixed(1)}ms`} />
        </div>

        <div className="note">
          <strong>관찰 포인트</strong>
          <p>
            Baseline에서는 부모 state가 바뀔 때 모든 행이 다시 계산됩니다.
            Optimized에서는 memoized row와 안정적인 callback 덕분에 선택된 행만
            반응합니다.
          </p>
        </div>
      </aside>

      <div className="data-surface">
        <Profiler
          id="customer-list"
          onRender={(_, __, actualDuration) => {
            if (ignoreMetricsCommit.current) {
              ignoreMetricsCommit.current = false;
              return;
            }

            ignoreMetricsCommit.current = true;
            setProfileMetrics((current) => ({
              commits: current.commits + 1,
              lastCommit: actualDuration,
            }));
          }}
        >
          <div className="customer-list">
            {visibleRecords.map((record) =>
              mode === "baseline" ? (
                <BaselineCustomerRow
                  key={record.id}
                  record={record}
                  selected={selectedId === record.id}
                  onToggle={() => toggleSelected(record.id)}
                />
              ) : (
                <OptimizedCustomerRow
                  key={record.id}
                  record={record}
                  selected={selectedId === record.id}
                  onToggle={toggleSelected}
                />
              ),
            )}
          </div>
        </Profiler>
      </div>
    </div>
  );
}

type RowProps = {
  record: CustomerRecord;
  selected: boolean;
};

type BaselineRowProps = RowProps & {
  onToggle: () => void;
};

function BaselineCustomerRow({ record, selected, onToggle }: BaselineRowProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const score = expensiveHealthScore(record);

  return (
    <button
      type="button"
      className={selected ? "customer-row selected" : "customer-row"}
      onClick={onToggle}
    >
      <RowContent record={record} score={score} renderCount={renderCount.current} />
    </button>
  );
}

type OptimizedRowProps = RowProps & {
  onToggle: (id: number) => void;
};

const OptimizedCustomerRow = memo(function OptimizedCustomerRow({
  record,
  selected,
  onToggle,
}: OptimizedRowProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const score = useMemo(() => expensiveHealthScore(record), [record]);
  const handleToggle = useCallback(() => onToggle(record.id), [onToggle, record.id]);

  return (
    <button
      type="button"
      className={selected ? "customer-row selected" : "customer-row"}
      onClick={handleToggle}
    >
      <RowContent record={record} score={score} renderCount={renderCount.current} />
    </button>
  );
});

function RowContent({
  record,
  score,
  renderCount,
}: {
  record: CustomerRecord;
  score: number;
  renderCount: number;
}) {
  return (
    <>
      <span>
        <strong>{record.name}</strong>
        <small>{record.plan}</small>
      </span>
      <span>{record.activity}% active</span>
      <span>${record.revenue.toLocaleString()}</span>
      <span className="score-pill">{score}</span>
      <span className="render-pill">render {renderCount}</span>
    </>
  );
}

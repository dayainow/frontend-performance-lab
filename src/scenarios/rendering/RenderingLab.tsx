import {
  lazy,
  memo,
  Profiler,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Metric } from "../../components/Metric";
import { SegmentedControl } from "../../components/SegmentedControl";
import {
  buildCustomerRecords,
  CustomerRecord,
  expensiveHealthScore,
} from "./rendering-utils";

type RenderMode = "baseline" | "optimized";
type PlanFilter = "all" | CustomerRecord["plan"];
type HealthFilter = "all" | "healthy" | "watch" | "risk";

type ScoredRecord = CustomerRecord & {
  score: number;
};

const DashboardCharts = lazy(() => import("./RenderingCharts"));
const virtualRowHeight = 54;
const virtualViewportHeight = 388;
const virtualOverscan = 7;

export function RenderingLab() {
  const [mode, setMode] = useState<RenderMode>("baseline");
  const [parentTicks, setParentTicks] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profileMetrics, setProfileMetrics] = useState({ commits: 0, lastCommit: 0 });
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [liveSeries, setLiveSeries] = useState(() => buildInitialLiveSeries());
  const ignoreMetricsCommit = useRef(false);
  const records = useMemo(() => buildCustomerRecords(96), []);
  const visibleRecords = useMemo(() => records.slice(0, 42), [records]);
  const analyticsRecords = useMemo(() => buildCustomerRecords(2400), []);
  const scoredRecords = useMemo(
    () =>
      analyticsRecords.map((record) => ({
        ...record,
        score: calculateDashboardScore(record),
      })),
    [analyticsRecords],
  );
  const deferredQuery = useDeferredValue(query);
  const filteredRecords = useMemo(
    () => filterRecords(scoredRecords, deferredQuery, planFilter, healthFilter),
    [deferredQuery, healthFilter, planFilter, scoredRecords],
  );
  const summary = useMemo(() => summarizeRecords(filteredRecords), [filteredRecords]);
  const planData = useMemo(() => buildPlanData(filteredRecords), [filteredRecords]);
  const trendData = useMemo(() => buildTrendData(filteredRecords), [filteredRecords]);

  useEffect(() => {
    if (!liveEnabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setLiveSeries((current) => {
        const lastPoint = current[current.length - 1];
        const nextTick = lastPoint.tick + 1;

        return [
          ...current.slice(-13),
          {
            tick: nextTick,
            label: `${nextTick}s`,
            throughput: 52 + ((nextTick * 19) % 46),
            latency: 22 + ((nextTick * 11) % 38),
          },
        ];
      });
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [liveEnabled]);

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

        <div className="filter-panel" aria-label="대시보드 검색 및 필터">
          <label className="filter-field">
            <span>Search</span>
            <input
              type="search"
              value={query}
              placeholder="name, owner, region"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="filter-row">
            <label className="filter-field">
              <span>Plan</span>
              <select
                value={planFilter}
                onChange={(event) => setPlanFilter(event.target.value as PlanFilter)}
              >
                <option value="all">All</option>
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Team">Team</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </label>

            <label className="filter-field">
              <span>Health</span>
              <select
                value={healthFilter}
                onChange={(event) => setHealthFilter(event.target.value as HealthFilter)}
              >
                <option value="all">All</option>
                <option value="healthy">Healthy</option>
                <option value="watch">Watch</option>
                <option value="risk">Risk</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            className={liveEnabled ? "secondary-action active" : "secondary-action"}
            onClick={() => setLiveEnabled((current) => !current)}
          >
            {liveEnabled ? "실시간 업데이트 중지" : "실시간 업데이트 시작"}
          </button>
        </div>

        <div className="note">
          <strong>관찰 포인트</strong>
          <p>
            Baseline에서는 부모 state가 바뀔 때 모든 행이 다시 계산됩니다.
            Optimized에서는 memoized row와 안정적인 callback 덕분에 선택된 행만
            반응합니다. 아래 대시보드는 Recharts 시각화, 실시간 데이터 업데이트,
            가상 스크롤, 검색/필터 UI까지 함께 확인합니다.
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

        <section className="analytics-workbench" aria-label="데이터 시각화 실험">
          <div className="kpi-grid">
            <Metric label="Filtered rows" value={filteredRecords.length.toLocaleString()} />
            <Metric label="Avg health" value={`${summary.averageScore}%`} />
            <Metric label="Revenue" value={`$${summary.revenue.toLocaleString()}`} />
            <Metric label="Open tickets" value={summary.tickets.toLocaleString()} />
          </div>

          <Suspense fallback={<div className="chart-loading">Loading dashboard charts...</div>}>
            <DashboardCharts
              trendData={trendData}
              planData={planData}
              liveSeries={liveSeries}
              liveEnabled={liveEnabled}
            />
          </Suspense>

          <VirtualizedCustomerTable
            records={filteredRecords}
            selectedId={selectedId}
            onToggle={toggleSelected}
          />
        </section>
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

function VirtualizedCustomerTable({
  records,
  selectedId,
  onToggle,
}: {
  records: ScoredRecord[];
  selectedId: number | null;
  onToggle: (id: number) => void;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = records.length * virtualRowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / virtualRowHeight) - virtualOverscan);
  const endIndex = Math.min(
    records.length,
    Math.ceil((scrollTop + virtualViewportHeight) / virtualRowHeight) + virtualOverscan,
  );
  const windowedRecords = records.slice(startIndex, endIndex);

  useEffect(() => {
    setScrollTop(0);
  }, [records]);

  return (
    <div className="virtual-table-shell">
      <div className="virtual-table-summary">
        <strong>Large data table</strong>
        <span>
          {records.length.toLocaleString()} rows · rendering {windowedRecords.length} visible rows
        </span>
      </div>

      <div className="virtual-table-header" aria-hidden="true">
        <span>Customer</span>
        <span>Plan</span>
        <span>Owner</span>
        <span>Region</span>
        <span>Health</span>
        <span>Revenue</span>
      </div>

      <div
        className="virtual-table-viewport"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <div className="virtual-table-spacer" style={{ height: totalHeight }}>
          {windowedRecords.map((record, index) => (
            <VirtualizedCustomerRow
              key={record.id}
              record={record}
              selected={selectedId === record.id}
              top={(startIndex + index) * virtualRowHeight}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const VirtualizedCustomerRow = memo(function VirtualizedCustomerRow({
  record,
  selected,
  top,
  onToggle,
}: {
  record: ScoredRecord;
  selected: boolean;
  top: number;
  onToggle: (id: number) => void;
}) {
  const handleToggle = useCallback(() => onToggle(record.id), [onToggle, record.id]);

  return (
    <button
      type="button"
      className={selected ? "virtual-table-row selected" : "virtual-table-row"}
      style={{ transform: `translateY(${top}px)` }}
      onClick={handleToggle}
    >
      <span>
        <strong>{record.name}</strong>
        <small>{record.tickets} tickets</small>
      </span>
      <span>{record.plan}</span>
      <span>{record.owner}</span>
      <span>{record.region}</span>
      <span className={record.score < 58 ? "health-cell risk" : "health-cell"}>
        {record.score}%
      </span>
      <span>${record.revenue.toLocaleString()}</span>
    </button>
  );
});

function calculateDashboardScore(record: CustomerRecord) {
  const revenueSignal = Math.min(18, record.revenue / 5600);
  const supportDrag = record.tickets * 1.35;

  return Math.max(0, Math.min(100, Math.round(record.activity + revenueSignal - supportDrag)));
}

function filterRecords(
  records: ScoredRecord[],
  query: string,
  planFilter: PlanFilter,
  healthFilter: HealthFilter,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return records.filter((record) => {
    if (planFilter !== "all" && record.plan !== planFilter) {
      return false;
    }

    if (healthFilter === "healthy" && record.score < 76) {
      return false;
    }

    if (healthFilter === "watch" && (record.score < 58 || record.score >= 76)) {
      return false;
    }

    if (healthFilter === "risk" && record.score >= 58) {
      return false;
    }

    if (normalizedQuery.length === 0) {
      return true;
    }

    return [record.name, record.plan, record.region, record.owner]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
}

function summarizeRecords(records: ScoredRecord[]) {
  if (records.length === 0) {
    return { averageScore: 0, revenue: 0, tickets: 0 };
  }

  const totals = records.reduce(
    (current, record) => ({
      score: current.score + record.score,
      revenue: current.revenue + record.revenue,
      tickets: current.tickets + record.tickets,
    }),
    { score: 0, revenue: 0, tickets: 0 },
  );

  return {
    averageScore: Math.round(totals.score / records.length),
    revenue: totals.revenue,
    tickets: totals.tickets,
  };
}

function buildPlanData(records: ScoredRecord[]) {
  const planCounts = new Map<CustomerRecord["plan"], number>([
    ["Free", 0],
    ["Pro", 0],
    ["Team", 0],
    ["Enterprise", 0],
  ]);

  records.forEach((record) => {
    planCounts.set(record.plan, (planCounts.get(record.plan) ?? 0) + 1);
  });

  return Array.from(planCounts, ([plan, count]) => ({ plan, count }));
}

function buildTrendData(records: ScoredRecord[]) {
  const buckets = Array.from({ length: 12 }, () => 0);

  records.forEach((record) => {
    buckets[record.id % buckets.length] += record.revenue;
  });

  return buckets.map((revenue, index) => {
    return {
      label: `W${index + 1}`,
      revenue: Math.round(revenue / 1000),
    };
  });
}

function buildInitialLiveSeries() {
  return Array.from({ length: 14 }, (_, index) => ({
    tick: index + 1,
    label: `${index + 1}s`,
    throughput: 52 + (((index + 1) * 19) % 46),
    latency: 22 + (((index + 1) * 11) % 38),
  }));
}

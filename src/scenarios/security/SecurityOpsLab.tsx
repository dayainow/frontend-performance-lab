import { lazy, memo, Suspense, useDeferredValue, useMemo, useState } from "react";
import { Metric } from "../../components/Metric";

type Severity = "all" | "critical" | "high" | "medium" | "low";
type Source = "all" | "edr" | "firewall" | "cloud" | "identity" | "network";
type TimeRange = "15m" | "1h" | "24h" | "7d";

type SecurityLog = {
  id: number;
  time: string;
  severity: Exclude<Severity, "all">;
  source: Exclude<Source, "all">;
  tactic: string;
  asset: string;
  user: string;
  country: string;
  message: string;
  risk: number;
};

type SecurityFilters = {
  query: string;
  severity: Severity;
  source: Source;
  timeRange: TimeRange;
  tactic: string;
};

const SecurityTopology3D = lazy(() => import("./SecurityTopology3D"));

const totalIndexedLogs = 1_250_000;
const virtualLogRowHeight = 48;
const virtualLogViewportHeight = 336;
const logOverscan = 8;
const severities: Array<Exclude<Severity, "all">> = ["critical", "high", "medium", "low"];
const sources: Array<Exclude<Source, "all">> = ["edr", "firewall", "cloud", "identity", "network"];
const tactics = ["Initial Access", "Execution", "Persistence", "Privilege Escalation", "Exfiltration"];
const countries = ["KR", "US", "JP", "DE", "SG", "BR", "IN", "AU"];

export function SecurityOpsLab() {
  const [filters, setFilters] = useState<SecurityFilters>({
    query: "",
    severity: "all",
    source: "all",
    timeRange: "24h",
    tactic: "all",
  });
  const [scrollTop, setScrollTop] = useState(0);
  const deferredFilters = useDeferredValue(filters);
  const filteredLogCount = useMemo(() => estimateLogCount(deferredFilters), [deferredFilters]);
  const summary = useMemo(() => buildSecuritySummary(deferredFilters), [deferredFilters]);
  const timeline = useMemo(() => buildTimelineData(deferredFilters), [deferredFilters]);
  const geoEvents = useMemo(() => buildGeoEvents(deferredFilters), [deferredFilters]);
  const severityMix = useMemo(() => buildSeverityMix(deferredFilters), [deferredFilters]);

  const updateFilter = <K extends keyof SecurityFilters>(key: K, value: SecurityFilters[K]) => {
    setScrollTop(0);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="security-lab">
      <aside className="security-control-panel">
        <div className="security-panel-heading">
          <span>SIEM / SOC</span>
          <strong>보안 관제 워크벤치</strong>
        </div>

        <label className="filter-field">
          <span>Log query</span>
          <input
            type="search"
            value={filters.query}
            placeholder="asset, user, country, tactic"
            onChange={(event) => updateFilter("query", event.target.value)}
          />
        </label>

        <div className="filter-row">
          <label className="filter-field">
            <span>Severity</span>
            <select
              value={filters.severity}
              onChange={(event) => updateFilter("severity", event.target.value as Severity)}
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Source</span>
            <select
              value={filters.source}
              onChange={(event) => updateFilter("source", event.target.value as Source)}
            >
              <option value="all">All</option>
              <option value="edr">EDR</option>
              <option value="firewall">Firewall</option>
              <option value="cloud">Cloud</option>
              <option value="identity">Identity</option>
              <option value="network">Network</option>
            </select>
          </label>
        </div>

        <div className="filter-row">
          <label className="filter-field">
            <span>Time</span>
            <select
              value={filters.timeRange}
              onChange={(event) => updateFilter("timeRange", event.target.value as TimeRange)}
            >
              <option value="15m">Last 15m</option>
              <option value="1h">Last 1h</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7d</option>
            </select>
          </label>

          <label className="filter-field">
            <span>MITRE tactic</span>
            <select
              value={filters.tactic}
              onChange={(event) => updateFilter("tactic", event.target.value)}
            >
              <option value="all">All</option>
              {tactics.map((tactic) => (
                <option key={tactic} value={tactic}>
                  {tactic}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="query-builder">
          <strong>Query builder</strong>
          <code>{buildQueryPreview(filters)}</code>
        </div>

        <div className="note">
          <strong>관찰 포인트</strong>
          <p>
            보안 관제 대시보드, SIEM/SOC UX, 로그 검색/필터링, 이벤트 타임라인,
            위협/지리/토폴로지 시각화와 백만 건 이상 로그 테이블 최적화를 한 번에
            확인합니다.
          </p>
        </div>
      </aside>

      <section className="security-ops-surface" aria-label="SIEM 보안 관제 대시보드">
        <div className="security-kpi-grid">
          <Metric label="Indexed logs" value={totalIndexedLogs.toLocaleString()} />
          <Metric label="Filtered logs" value={filteredLogCount.toLocaleString()} />
          <Metric label="Open incidents" value={summary.incidents.toLocaleString()} />
          <Metric label="Avg risk" value={`${summary.averageRisk}%`} />
        </div>

        <div className="security-dashboard-grid">
          <div className="security-card topology-card">
            <div className="security-card-heading">
              <strong>3D network topology</strong>
              <span>Three.js</span>
            </div>
            <Suspense fallback={<div className="topology-loading">Loading 3D topology...</div>}>
              <SecurityTopology3D riskLevel={summary.averageRisk} />
            </Suspense>
          </div>

          <div className="security-card">
            <div className="security-card-heading">
              <strong>Threat timeline</strong>
              <span>event stream</span>
            </div>
            <ThreatTimeline data={timeline} />
          </div>

          <div className="security-card">
            <div className="security-card-heading">
              <strong>Geo threat map</strong>
              <span>mapping</span>
            </div>
            <GeoThreatMap events={geoEvents} />
          </div>

          <div className="security-card">
            <div className="security-card-heading">
              <strong>Severity graph</strong>
              <span>custom chart</span>
            </div>
            <SeverityGraph data={severityMix} />
          </div>
        </div>

        <LogTable
          filters={deferredFilters}
          rowCount={filteredLogCount}
          scrollTop={scrollTop}
          onScrollTopChange={setScrollTop}
        />
      </section>
    </div>
  );
}

function ThreatTimeline({ data }: { data: Array<{ label: string; critical: number; high: number }> }) {
  const maxValue = Math.max(...data.map((point) => point.critical + point.high), 1);

  return (
    <div className="threat-timeline">
      {data.map((point) => (
        <div key={point.label} className="timeline-slot">
          <span>{point.label}</span>
          <div>
            <i
              className="critical"
              style={{ height: `${Math.max(8, (point.critical / maxValue) * 100)}%` }}
            />
            <i
              className="high"
              style={{ height: `${Math.max(8, (point.high / maxValue) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function GeoThreatMap({ events }: { events: Array<{ country: string; x: number; y: number; risk: number }> }) {
  return (
    <div className="geo-map" aria-label="지리 기반 위협 이벤트 맵">
      <svg viewBox="0 0 420 230" role="img">
        <path
          d="M38 84 C82 45 130 68 156 52 C188 32 219 50 234 76 C270 49 319 48 370 76 C351 117 379 139 326 162 C281 183 248 154 218 172 C181 194 151 162 121 172 C83 185 52 144 38 84Z"
          fill="#e6edf0"
        />
        <path
          d="M72 125 C112 104 162 118 196 105 C235 90 266 105 314 97"
          fill="none"
          stroke="#b7c6ce"
          strokeDasharray="5 6"
          strokeWidth="2"
        />
        {events.map((event) => (
          <g key={event.country} transform={`translate(${event.x} ${event.y})`}>
            <circle r={12 + event.risk / 10} fill="rgba(220, 38, 38, 0.15)" />
            <circle r="5" fill={event.risk > 72 ? "#dc2626" : "#f59e0b"} />
            <text y="28" textAnchor="middle">
              {event.country}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function SeverityGraph({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="severity-graph">
      {data.map((item) => (
        <div key={item.label} className="severity-row">
          <span>{item.label}</span>
          <div>
            <i style={{ width: `${(item.value / maxValue) * 100}%`, background: item.color }} />
          </div>
          <strong>{item.value.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

function LogTable({
  filters,
  rowCount,
  scrollTop,
  onScrollTopChange,
}: {
  filters: SecurityFilters;
  rowCount: number;
  scrollTop: number;
  onScrollTopChange: (value: number) => void;
}) {
  const totalHeight = rowCount * virtualLogRowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / virtualLogRowHeight) - logOverscan);
  const endIndex = Math.min(
    rowCount,
    Math.ceil((scrollTop + virtualLogViewportHeight) / virtualLogRowHeight) + logOverscan,
  );
  const rows = useMemo(
    () =>
      Array.from({ length: endIndex - startIndex }, (_, index) =>
        buildSecurityLog(startIndex + index, filters),
      ),
    [endIndex, filters, startIndex],
  );

  return (
    <div className="security-log-table">
      <div className="virtual-table-summary">
        <strong>Optimized SIEM log table</strong>
        <span>
          {rowCount.toLocaleString()} matching rows · rendering {rows.length} visible rows
        </span>
      </div>
      <div className="security-log-header" aria-hidden="true">
        <span>Time</span>
        <span>Severity</span>
        <span>Source</span>
        <span>Asset</span>
        <span>Tactic</span>
        <span>Message</span>
        <span>Risk</span>
      </div>
      <div
        className="security-log-viewport"
        onScroll={(event) => onScrollTopChange(event.currentTarget.scrollTop)}
      >
        <div className="security-log-spacer" style={{ height: totalHeight }}>
          {rows.map((row, index) => (
            <SecurityLogRow
              key={`${row.id}-${row.severity}-${row.source}`}
              log={row}
              top={(startIndex + index) * virtualLogRowHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const SecurityLogRow = memo(function SecurityLogRow({
  log,
  top,
}: {
  log: SecurityLog;
  top: number;
}) {
  return (
    <div className="security-log-row" style={{ transform: `translateY(${top}px)` }}>
      <span>{log.time}</span>
      <span className={`severity-badge ${log.severity}`}>{log.severity}</span>
      <span>{log.source}</span>
      <span>{log.asset}</span>
      <span>{log.tactic}</span>
      <span>{log.message}</span>
      <span>{log.risk}%</span>
    </div>
  );
});

function buildQueryPreview(filters: SecurityFilters) {
  const parts = [
    filters.query.trim() ? `text:${filters.query.trim()}` : "",
    filters.severity !== "all" ? `severity:${filters.severity}` : "",
    filters.source !== "all" ? `source:${filters.source}` : "",
    filters.tactic !== "all" ? `tactic:"${filters.tactic}"` : "",
    `range:${filters.timeRange}`,
  ].filter(Boolean);

  return parts.join(" AND ");
}

function estimateLogCount(filters: SecurityFilters) {
  let count = totalIndexedLogs * timeRangeRatio(filters.timeRange);

  if (filters.severity !== "all") {
    count *= { critical: 0.08, high: 0.18, medium: 0.34, low: 0.4 }[filters.severity];
  }

  if (filters.source !== "all") {
    count *= 0.22;
  }

  if (filters.tactic !== "all") {
    count *= 0.2;
  }

  if (filters.query.trim().length > 0) {
    count *= 0.36;
  }

  return Math.max(64, Math.round(count));
}

function buildSecuritySummary(filters: SecurityFilters) {
  const filtered = estimateLogCount(filters);
  const severityBoost = filters.severity === "critical" ? 24 : filters.severity === "high" ? 14 : 0;
  const sourceBoost = filters.source === "identity" || filters.source === "cloud" ? 7 : 2;
  const averageRisk = Math.min(98, Math.round(48 + severityBoost + sourceBoost + filtered / 90_000));

  return {
    incidents: Math.round(filtered * (averageRisk > 70 ? 0.018 : 0.009)),
    averageRisk,
  };
}

function buildTimelineData(filters: SecurityFilters) {
  const base = estimateLogCount(filters) / 1200;

  return Array.from({ length: 12 }, (_, index) => ({
    label: `${index * 2}h`,
    critical: Math.round(base * (0.35 + ((index * 7) % 9) / 20)),
    high: Math.round(base * (0.55 + ((index * 5) % 8) / 18)),
  }));
}

function buildGeoEvents(filters: SecurityFilters) {
  const riskBase = buildSecuritySummary(filters).averageRisk;
  const positions = [
    { country: "KR", x: 316, y: 112 },
    { country: "US", x: 88, y: 100 },
    { country: "JP", x: 348, y: 118 },
    { country: "DE", x: 214, y: 86 },
    { country: "SG", x: 290, y: 158 },
    { country: "BR", x: 145, y: 162 },
  ];

  return positions.map((position, index) => ({
    ...position,
    risk: Math.min(96, riskBase + ((index * 11) % 24) - 8),
  }));
}

function buildSeverityMix(filters: SecurityFilters) {
  const count = estimateLogCount(filters);
  const focused = filters.severity;

  return [
    { label: "Critical", value: mixValue(count, focused, "critical", 0.08), color: "#dc2626" },
    { label: "High", value: mixValue(count, focused, "high", 0.18), color: "#f97316" },
    { label: "Medium", value: mixValue(count, focused, "medium", 0.34), color: "#2563eb" },
    { label: "Low", value: mixValue(count, focused, "low", 0.4), color: "#16a34a" },
  ];
}

function mixValue(
  total: number,
  focused: Severity,
  severity: Exclude<Severity, "all">,
  ratio: number,
) {
  if (focused === "all" || focused === severity) {
    return Math.round(total * ratio);
  }

  return Math.round(total * ratio * 0.08);
}

function buildSecurityLog(rowIndex: number, filters: SecurityFilters): SecurityLog {
  const seed = rowIndex * 37 + filters.timeRange.length * 13;
  const severity =
    filters.severity === "all" ? severities[seed % severities.length] : filters.severity;
  const source = filters.source === "all" ? sources[(seed + 2) % sources.length] : filters.source;
  const tactic = filters.tactic === "all" ? tactics[(seed + 3) % tactics.length] : filters.tactic;
  const country = countries[(seed + 5) % countries.length];
  const asset = `${source.toUpperCase()}-${String((seed % 9000) + 1000)}`;
  const user = `user.${String((seed * 7) % 800).padStart(3, "0")}`;
  const risk = Math.min(99, 32 + severityRisk(severity) + ((seed * 11) % 30));
  const queryHint = filters.query.trim() ? ` matched "${filters.query.trim()}"` : "";

  return {
    id: 900_000 + rowIndex,
    time: `${String((seed % 24)).padStart(2, "0")}:${String((seed * 3) % 60).padStart(2, "0")}`,
    severity,
    source,
    tactic,
    asset,
    user,
    country,
    message: `${tactic} signal from ${country} on ${asset} for ${user}${queryHint}`,
    risk,
  };
}

function severityRisk(severity: Exclude<Severity, "all">) {
  return { critical: 42, high: 30, medium: 16, low: 5 }[severity];
}

function timeRangeRatio(range: TimeRange) {
  return { "15m": 0.04, "1h": 0.12, "24h": 0.62, "7d": 1 }[range];
}

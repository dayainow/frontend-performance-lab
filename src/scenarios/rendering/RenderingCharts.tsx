import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendPoint = {
  label: string;
  revenue: number;
};

type PlanPoint = {
  plan: string;
  count: number;
};

type LivePoint = {
  tick: number;
  label: string;
  throughput: number;
  latency: number;
};

type RenderingChartsProps = {
  trendData: TrendPoint[];
  planData: PlanPoint[];
  liveSeries: LivePoint[];
  liveEnabled: boolean;
};

export default function RenderingCharts({
  trendData,
  planData,
  liveSeries,
  liveEnabled,
}: RenderingChartsProps) {
  return (
    <>
      <div className="chart-grid">
        <div className="chart-panel">
          <div className="chart-heading">
            <strong>Revenue trend</strong>
            <span>Recharts AreaChart</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 10, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="#e5edf0" strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f766e"
                  fill="#99f6e4"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-panel">
          <div className="chart-heading">
            <strong>Plan mix</strong>
            <span>Recharts BarChart</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData} margin={{ top: 8, right: 10, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="#e5edf0" strokeDasharray="3 3" />
                <XAxis dataKey="plan" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-panel">
        <div className="chart-heading">
          <strong>Live operations feed</strong>
          <span>{liveEnabled ? "streaming" : "paused"}</span>
        </div>
        <div className="chart-body compact">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveSeries} margin={{ top: 8, right: 10, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#e5edf0" strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="throughput"
                stroke="#16a34a"
                fill="#bbf7d0"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#dc2626"
                fill="#fecaca"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

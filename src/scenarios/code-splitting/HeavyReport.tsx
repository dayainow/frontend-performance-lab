function buildReportRows() {
  return Array.from({ length: 18 }, (_, index) => {
    let value = 0;
    for (let step = 0; step < 12000; step += 1) {
      value += Math.sin((index + 1) * step) * Math.cos(step / 8);
    }

    return {
      label: `Segment ${String(index + 1).padStart(2, "0")}`,
      value: Math.abs(Math.round(value * 100)),
    };
  });
}

export default function HeavyReport() {
  const rows = buildReportRows();
  const max = Math.max(...rows.map((row) => row.value));

  return (
    <div className="heavy-report">
      <header>
        <p className="eyebrow">Lazy loaded module</p>
        <h3>Revenue health report</h3>
      </header>
      <div className="bar-list">
        {rows.map((row) => (
          <div className="bar-row" key={row.label}>
            <span>{row.label}</span>
            <div>
              <i style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }} />
            </div>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

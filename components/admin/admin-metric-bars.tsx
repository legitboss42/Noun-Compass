export type AdminMetricDatum = {
  label: string | number;
  value: number;
};

export function AdminMetricBars({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: readonly AdminMetricDatum[];
}) {
  const maximum = Math.max(...data.map((item) => item.value), 1);
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {data.length ? (
        <div className="admin-bars">
          {data.map((item) => (
            <div className="admin-bar-row" key={String(item.label)}>
              <span>{item.label}</span>
              <div aria-hidden="true">
                <i style={{ width: `${(item.value / maximum) * 100}%` }} />
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p>No activity was recorded in this range.</p>
      )}
      <p className="admin-sr-summary">
        {data.length
          ? data.map((item) => `${item.label}: ${item.value}`).join("; ")
          : "No data available."}
      </p>
    </section>
  );
}

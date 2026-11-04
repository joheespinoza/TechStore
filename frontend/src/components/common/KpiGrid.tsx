export type Kpi = {
  label: string;
  value: string;
  note?: string;
  tone?: "warning" | "danger";
};

export default function KpiGrid({
  items,
  label,
}: {
  items: Kpi[];
  label: string;
}) {
  return (
    <ul className="kpi-grid" aria-label={label}>
      {items.map((item) => (
        <li
          key={item.label}
          className={item.tone ? `kpi-card is-${item.tone}` : "kpi-card"}
        >
          <span className="kpi-label">{item.label}</span>
          <strong className="kpi-value">{item.value}</strong>
          {item.note && <span className="kpi-note">{item.note}</span>}
        </li>
      ))}
    </ul>
  );
}
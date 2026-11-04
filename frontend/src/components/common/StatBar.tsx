export default function StatBar({ percent }: { percent: number }) {
  const width = Math.max(0, Math.min(100, percent));

  return (
    <span className="stat-bar" aria-hidden="true">
      <span className="stat-bar-fill" style={{ width: `${width}%` }} />
    </span>
  );
}
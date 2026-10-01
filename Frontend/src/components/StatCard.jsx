export default function StatCard({ label, value, change, icon, tone = 'teal' }) {
  return <article className="stat-card"><div className="stat-card-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><div className="stat-value">{value}</div><div className="stat-trend"><span className="trend-up">↗ {change}</span><span>vs last month</span></div></article>
}

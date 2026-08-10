export default function StatCard({ label, value, accent = false }) {
  return (
    <div className="bg-white rounded-xl border border-forest-800/10 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-600">{label}</p>
      <p className={`font-display text-3xl mt-2 ${accent ? "text-amber-600" : "text-forest-950"}`}>
        {value}
      </p>
    </div>
  );
}

export default function StatCard({ value, label, sub, accent }) {
  return (
    <div className="bg-white border-r border-[#E8E8E8] last:border-r-0 px-8 py-6 flex flex-col gap-1">
      <p className={`text-4xl font-light tracking-tight ${accent ? 'text-black' : 'text-black'}`}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-black font-medium mt-1">{label}</p>
      <p className="text-[10px] text-gray-400 tracking-wide">{sub}</p>
    </div>
  );
}

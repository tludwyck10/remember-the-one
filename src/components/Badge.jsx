const variants = {
  'Inner Circle':         'bg-amber-50 text-amber-700 border border-amber-200',
  'Disciples':            'bg-teal-50 text-teal-700 border border-teal-200',
  'Active Relationships': 'bg-blue-50 text-blue-700 border border-blue-200',
  'New Connections':      'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function Badge({ label }) {
  const cls = variants[label] || 'bg-gray-100 text-gray-500 border border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.08em] ${cls}`}>
      {label}
    </span>
  );
}

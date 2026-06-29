const COLORS = [
  { bg: 'bg-[#1B2A4A]', text: 'text-white' },
  { bg: 'bg-[#2A9D8F]', text: 'text-white' },
  { bg: 'bg-gray-700',  text: 'text-white' },
  { bg: 'bg-stone-600', text: 'text-white' },
  { bg: 'bg-slate-700', text: 'text-white' },
  { bg: 'bg-gray-500',  text: 'text-white' },
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Avatar({ name, size = 'md' }) {
  const { bg, text } = getColor(name);
  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[8px] rounded-full',
    sm: 'w-8 h-8 text-[10px] rounded-full',
    md: 'w-9 h-9 text-[11px] rounded-full',
    lg: 'w-12 h-12 text-sm rounded-full',
    xl: 'w-16 h-16 text-base rounded-full',
  };

  return (
    <div className={`${sizeClasses[size]} ${bg} ${text} flex items-center justify-center font-semibold flex-shrink-0 tracking-wider`}>
      {initials}
    </div>
  );
}

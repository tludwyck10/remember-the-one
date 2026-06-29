export default function Placeholder({ title }) {
  return (
    <div className="page-enter flex flex-col items-center justify-center flex-1 p-16 text-center bg-white min-h-full">
      <p className="section-label mb-4">Coming Soon</p>
      <h1 className="text-3xl font-light text-black tracking-tight">{title}</h1>
      <p className="text-xs text-gray-400 max-w-xs mt-4 leading-relaxed">
        This section is being built. You're building something meaningful — one person at a time.
      </p>
    </div>
  );
}

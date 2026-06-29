export default function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F4F1]">
      <div className="text-center">
        <div className="flex gap-1.5 justify-center mb-5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#2A9D8F]"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400">
          Remember The One
        </p>
        <style>{`
          @keyframes pulse {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
            40%            { opacity: 1;   transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}

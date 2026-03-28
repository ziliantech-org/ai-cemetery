export default function MoonLight() {
  return (
    <>
      {/* Moon */}
      <div className="absolute top-[8%] right-[15%] z-[1] pointer-events-none">
        <div className="relative">
          {/* Moon glow */}
          <div
            className="absolute -inset-16 rounded-full animate-glow-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,220,0.08) 0%, transparent 70%)',
            }}
          />
          {/* Moon body */}
          <div
            className="w-16 h-16 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #f0f0e0, #d0d0c0, #a0a090)',
              boxShadow: '0 0 40px rgba(255,255,220,0.15), 0 0 80px rgba(255,255,220,0.05)',
            }}
          />
        </div>
      </div>

      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute z-0 pointer-events-none rounded-full bg-white"
          style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            top: `${5 + Math.random() * 30}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.4,
            animation: `glowPulse ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
          }}
        />
      ))}

      {/* Moonbeam */}
      <div
        className="absolute top-0 right-[10%] w-[30%] h-full z-[1] pointer-events-none opacity-[0.03]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,220,0.3) 0%, transparent 60%)',
        }}
      />
    </>
  );
}

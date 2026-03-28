export default function FogEffect() {
  return (
    <>
      {/* Fog layer 1 — slow drift */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none animate-fog-drift opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 120% 40% at 30% 80%, rgba(180,180,200,0.08) 0%, transparent 60%)',
        }}
      />
      {/* Fog layer 2 — reverse drift */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none animate-fog-drift-reverse opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 100% 35% at 70% 75%, rgba(180,180,200,0.06) 0%, transparent 55%)',
        }}
      />
      {/* Low fog near ground */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[30%] z-[3] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(160,160,180,0.05) 0%, transparent 100%)',
        }}
      />
    </>
  );
}

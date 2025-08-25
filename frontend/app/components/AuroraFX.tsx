"use client";

export default function AuroraFX() {
  return (
    <div 
      className="aurora-container" 
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Aurora Gradients */}
      <div className="aurora-gradient-1" />
      <div className="aurora-gradient-2" />
      
      {/* Noise Texture Overlay */}
      <div className="aurora-noise" />
      
      {/* Data Streams */}
      <div className="data-streams" />
      
      {/* Readability Mask */}
      <div className="aurora-mask" />
    </div>
  );
}

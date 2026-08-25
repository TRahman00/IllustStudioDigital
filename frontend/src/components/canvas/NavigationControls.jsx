import React from 'react';

export const NavigationControls = ({
  scale,
  rotation,
  zoomIn,
  zoomOut,
  rotateClockwise,
  rotateCounterClockwise,
  resetView,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#12181B]/90 backdrop-blur-md border border-[#1E262B] px-4 py-2 rounded-full shadow-2xl text-xs text-gray-300 z-50">
      {/* Zoom Controls */}
      <button
        onClick={zoomOut}
        className="px-2.5 py-1 rounded-full bg-[#1A2226] hover:bg-[#14cba8] hover:text-black transition-all font-mono"
        title="Zoom Out"
      >
        -
      </button>
      <span className="font-mono text-[#14cba8] px-1 w-12 text-center">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={zoomIn}
        className="px-2.5 py-1 rounded-full bg-[#1A2226] hover:bg-[#14cba8] hover:text-black transition-all font-mono"
        title="Zoom In"
      >
        +
      </button>

      <div className="h-4 w-[1px] bg-[#222C32] mx-1" />

      {/* Rotation Controls */}
      <button
        onClick={rotateCounterClockwise}
        className="px-3 py-1 rounded-full bg-[#1A2226] hover:bg-[#14cba8] hover:text-black transition-all"
        title="Rotate Left"
      >
        ↺
      </button>
      <span className="font-mono text-[#14cba8] px-1 w-10 text-center">
        {rotation}°
      </span>
      <button
        onClick={rotateClockwise}
        className="px-3 py-1 rounded-full bg-[#1A2226] hover:bg-[#14cba8] hover:text-black transition-all"
        title="Rotate Right"
      >
        ↻
      </button>

      <div className="h-4 w-[1px] bg-[#222C32] mx-1" />

      {/* Reset */}
      <button
        onClick={resetView}
        className="px-3 py-1 rounded-full bg-[#14cba8] text-black font-semibold hover:brightness-110 transition-all"
      >
        Reset
      </button>
    </div>
  );
};  
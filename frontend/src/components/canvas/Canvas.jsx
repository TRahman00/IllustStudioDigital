import React, { useRef } from 'react';
import { useCanvasNavigation } from '../../hooks/useCanvasNavigation';
import { NavigationControls } from './NavigationControls';

export const Canvas = () => {
  const nav = useCanvasNavigation();
  const canvasRef = useRef(null);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-[#0B0F12] overflow-hidden flex items-center justify-center select-none">
      
      {/* ১. Pan & Zoom Canvas Area */}
      <div
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={nav.handleMouseDown}
        onMouseMove={nav.handleMouseMove}
        onMouseUp={nav.handleMouseUp}
        onWheel={nav.handleWheel}
      >
        <div
          style={{
            transform: `translate(${nav.position.x}px, ${nav.position.y}px) scale(${nav.scale}) rotate(${nav.rotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out',
          }}
          className="border border-[#1E262B] bg-[#12181B] shadow-2xl rounded-lg"
        >
          {/* Canvas Board */}
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            className="rounded bg-white cursor-crosshair" 
          />
        </div>
      </div>

      {/* ২. Bottom Navigation Toolbar (Zoom, Pan Status, Rotation Buttons) */}
      <NavigationControls {...nav} />
    </div>
  );
};


export default Canvas;
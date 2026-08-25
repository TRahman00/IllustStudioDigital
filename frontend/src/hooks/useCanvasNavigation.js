import { useState, useRef, useCallback } from 'react';

export const useCanvasNavigation = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Panning Logic (Mouse Down, Move, Up)
  const handleMouseDown = useCallback((e) => {
    // Spacebar pressed or Middle Click or Pan Mode
    if (e.button === 1 || e.buttons === 4 || e.shiftKey) {
      isDragging.current = true;
      startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Zooming Logic (Wheel)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((prevScale) => Math.min(Math.max(prevScale * zoomFactor, 0.2), 5));
  }, []);

  // Control Actions
  const zoomIn = () => setScale((prev) => Math.min(prev * 1.2, 5));
  const zoomOut = () => setScale((prev) => Math.max(prev * 0.8, 0.2));
  const rotateClockwise = () => setRotation((prev) => (prev + 90) % 360);
  const rotateCounterClockwise = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  return {
    scale,
    position,
    rotation,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    zoomIn,
    zoomOut,
    rotateClockwise,
    rotateCounterClockwise,
    resetView,
  };
};
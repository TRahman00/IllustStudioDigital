import React, { useState, useRef } from 'react';

const AnimationTimeline = ({ frames, setFrames, canvasRef }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const play = () => {
    if (isPlaying || frames.length === 0) return;
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 200); // 5 fps
  };

  const pause = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
  };

  const addFrame = () => {
    if (!canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    setFrames([...frames, dataUrl]);
    setCurrentFrame(frames.length);
  };

  const showFrame = (idx) => {
    if (!canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = frames[idx];
    setCurrentFrame(idx);
  };

  const exportAnimation = () => {
    // For now, just concatenate frames as data URLs and download as JSON (or you can integrate GIF generation later)
    const json = JSON.stringify(frames);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'animation_frames.json';
    link.href = url;
    link.click();
  };

  return (
    <div className="bg-gray-100 p-3 rounded">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={play} disabled={frames.length === 0} className="px-3 py-1 bg-blue-500 text-white rounded">▶ Play</button>
        <button onClick={pause} disabled={!isPlaying} className="px-3 py-1 bg-red-500 text-white rounded">⏸ Pause</button>
        <button onClick={addFrame} className="px-3 py-1 bg-green-500 text-white rounded">+ Add Frame</button>
        <button onClick={exportAnimation} disabled={frames.length === 0} className="px-3 py-1 bg-gray-700 text-white rounded">Export</button>
        <span className="text-sm">Frame: {currentFrame + 1}/{frames.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {frames.map((frame, idx) => (
          <div key={idx} className={`w-16 h-16 border-2 ${idx === currentFrame ? 'border-blue-500' : 'border-gray-300'} cursor-pointer`} onClick={() => showFrame(idx)}>
            <img src={frame} alt={`Frame ${idx + 1}`} className="w-full h-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimationTimeline;
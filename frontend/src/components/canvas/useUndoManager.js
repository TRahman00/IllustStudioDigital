import { useRef, useCallback } from 'react';

export function useUndoManager(limit = 40) {
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const push = useCallback((canvas) => {
    undoStack.current.push({ canvas, url: canvas.toDataURL() });
    if (undoStack.current.length > limit) undoStack.current.shift();
    redoStack.current.length = 0;
  }, [limit]);

  function loadInto(entry) {
    const ctx = entry.canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, entry.canvas.width, entry.canvas.height);
      ctx.drawImage(img, 0, 0);
      if (entry.canvas.__thumbUpdate) entry.canvas.__thumbUpdate();
    };
    img.src = entry.url;
  }

  const undo = useCallback(() => {
    const e = undoStack.current.pop();
    if (!e) return;
    redoStack.current.push({ canvas: e.canvas, url: e.canvas.toDataURL() });
    loadInto(e);
  }, []);
  const redo = useCallback(() => {
    const e = redoStack.current.pop();
    if (!e) return;
    undoStack.current.push({ canvas: e.canvas, url: e.canvas.toDataURL() });
    loadInto(e);
  }, []);

  return { push, undo, redo };
}
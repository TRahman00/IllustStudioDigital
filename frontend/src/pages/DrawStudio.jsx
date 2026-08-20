import { useEffect, useRef, useState } from 'react';
import client from '../api/client.js';
import ColorWheel from '../components/canvas/ColorWheel.jsx';
import { useUndoManager } from '../components/canvas/useUndoManager.js';
import {
  BrushIcon, PencilIcon, AirbrushIcon, EraserIcon, RectIcon, EllipseIcon, LineIcon, SelectIcon,
  UndoIcon, RedoIcon, EyeIcon, EyeOffIcon, DuplicateIcon, ArrowUpIcon, ArrowDownIcon, CloseIcon, PlusIcon,
} from '../components/icons/Icons.jsx';

const DRAW_W = 900, DRAW_H = 600;
const TOOLS = [
  { id: 'brush', Icon: BrushIcon },
  { id: 'pencil', Icon: PencilIcon },
  { id: 'airbrush', Icon: AirbrushIcon },
  { id: 'eraser', Icon: EraserIcon },
];
const SHAPE_TOOLS = [
  { id: 'rect', Icon: RectIcon },
  { id: 'ellipse', Icon: EllipseIcon },
  { id: 'line', Icon: LineIcon },
];

function normRect(a, b) { return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }; }
function getCanvasPos(e, canvasEl) {
  const rect = canvasEl.getBoundingClientRect();
  return { x: (e.clientX - rect.left) * (canvasEl.width / rect.width), y: (e.clientY - rect.top) * (canvasEl.height / rect.height) };
}

export default function DrawStudio({ projectId }) {
  const [isPanActive, setIsPanActive] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#14B8A6');
  const [size, setSize] = useState(14);
  const [shapeFill, setShapeFill] = useState(true);
  const [zoom, setZoomState] = useState(1);
  const [layersVersion, setLayersVersion] = useState(0);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const toolRef = useRef(tool), colorRef = useRef(color), sizeRef = useRef(size), shapeFillRef = useRef(shapeFill);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { sizeRef.current = size; }, [size]);
  useEffect(() => { shapeFillRef.current = shapeFill; }, [shapeFill]);

  const layersRef = useRef([]);
  const layerCounterRef = useRef(0);
  const stageInnerRef = useRef(null);
  const layersMountRef = useRef(null);
  const overlayRef = useRef(null);
  const isPointerDownRef = useRef(false);
  const startPosRef = useRef(null);
  const lastPosRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (isPanActive) {
      isDragging.current = true;
      startPos.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current && isPanActive) {
      setPanOffset({
        x: e.clientX - startPos.current.x,
        y: e.clientY - startPos.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const drawUM = useUndoManager();

  function activeLayer() { return layersRef.current.find((l) => l.id === activeLayerId); }

  function renderLayerStack() {
    const mount = layersMountRef.current;
    if (!mount) return;
    mount.innerHTML = '';
    layersRef.current.forEach((l, i) => {
      l.canvas.style.position = 'absolute'; l.canvas.style.inset = '0'; l.canvas.style.zIndex = i;
      l.canvas.style.display = l.visible ? 'block' : 'none'; l.canvas.style.opacity = l.opacity; l.canvas.style.pointerEvents = 'none';
      mount.appendChild(l.canvas);
    });
  }
  function addLayer(name) {
    const c = document.createElement('canvas'); c.width = DRAW_W; c.height = DRAW_H;
    const layer = { id: 'L' + layerCounterRef.current++, name: name || `Layer ${layersRef.current.length + 1}`, canvas: c, ctx: c.getContext('2d'), visible: true, opacity: 1 };
    layersRef.current.push(layer);
    setActiveLayerId(layer.id);
    renderLayerStack(); setLayersVersion((v) => v + 1);
    return layer;
  }
  function duplicateLayer() {
    const src = activeLayer(); if (!src) return;
    const idx = layersRef.current.indexOf(src);
    const c = document.createElement('canvas'); c.width = DRAW_W; c.height = DRAW_H;
    c.getContext('2d').drawImage(src.canvas, 0, 0);
    const layer = { id: 'L' + layerCounterRef.current++, name: src.name + ' copy', canvas: c, ctx: c.getContext('2d'), visible: true, opacity: src.opacity };
    layersRef.current.splice(idx + 1, 0, layer);
    setActiveLayerId(layer.id);
    renderLayerStack(); setLayersVersion((v) => v + 1);
  }
  function deleteLayer(layerId) {
    if (layersRef.current.length <= 1) return;
    const idx = layersRef.current.findIndex((l) => l.id === layerId);
    layersRef.current.splice(idx, 1);
    if (activeLayerId === layerId) setActiveLayerId(layersRef.current[Math.max(0, idx - 1)].id);
    renderLayerStack(); setLayersVersion((v) => v + 1);
  }
  function moveLayer(layerId, dir) {
    const idx = layersRef.current.findIndex((l) => l.id === layerId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= layersRef.current.length) return;
    const tmp = layersRef.current[idx]; layersRef.current[idx] = layersRef.current[newIdx]; layersRef.current[newIdx] = tmp;
    renderLayerStack(); setLayersVersion((v) => v + 1);
  }
  function toggleVisible(layerId) {
    const l = layersRef.current.find((x) => x.id === layerId); l.visible = !l.visible;
    renderLayerStack(); setLayersVersion((v) => v + 1);
  }
  function setOpacity(layerId, val) { const l = layersRef.current.find((x) => x.id === layerId); l.opacity = val; renderLayerStack(); }
  function renameLayer(layerId, name) { const l = layersRef.current.find((x) => x.id === layerId); l.name = name; }

  function drawDab(ctx, a, b, t) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (t === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = 'rgba(0,0,0,1)'; }
    else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = colorRef.current; ctx.fillStyle = colorRef.current; }
    if (t === 'airbrush') {
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 10; i++) {
        const ang = Math.random() * Math.PI * 2, rad = Math.random() * sizeRef.current;
        ctx.beginPath(); ctx.globalAlpha = 0.25;
        ctx.arc(b.x + Math.cos(ang) * rad, b.y + Math.sin(ang) * rad, Math.max(1, sizeRef.current * 0.08), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1; return;
    }
    ctx.lineWidth = t === 'pencil' ? Math.max(1, sizeRef.current * 0.35) : sizeRef.current;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  function clearOverlay() { overlayRef.current.getContext('2d').clearRect(0, 0, DRAW_W, DRAW_H); }
  function drawMarqueePreview(ctx, a, b) {
    const r = normRect(a, b);
    ctx.save(); ctx.strokeStyle = '#14B8A6'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w, r.h); ctx.restore();
  }
  function drawShapePreview(ctx, a, b, t) {
    ctx.save(); ctx.strokeStyle = colorRef.current; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    if (t === 'rect') { const r = normRect(a, b); ctx.strokeRect(r.x, r.y, r.w, r.h); }
    else if (t === 'ellipse') { const r = normRect(a, b); ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2); ctx.stroke(); }
    else if (t === 'line') { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    ctx.restore();
  }
  function commitShape(ctx, a, b, t) {
    ctx.lineWidth = sizeRef.current; ctx.strokeStyle = colorRef.current; ctx.fillStyle = colorRef.current;
    if (t === 'rect') { const r = normRect(a, b); shapeFillRef.current ? ctx.fillRect(r.x, r.y, r.w, r.h) : ctx.strokeRect(r.x, r.y, r.w, r.h); }
    else if (t === 'ellipse') { const r = normRect(a, b); ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2); shapeFillRef.current ? ctx.fill() : ctx.stroke(); }
    else if (t === 'line') { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  }

  useEffect(() => {
    const overlay = overlayRef.current;
    function onDown(e) {
      const pos = getCanvasPos(e, overlay);
      isPointerDownRef.current = true; startPosRef.current = pos; lastPosRef.current = pos;
      const t = toolRef.current, layer = activeLayer(); if (!layer) return;
      if (['brush', 'pencil', 'airbrush', 'eraser'].includes(t)) { drawUM.push(layer.canvas); drawDab(layer.ctx, pos, pos, t); }
      else if (['rect', 'ellipse', 'line'].includes(t)) { clearOverlay(); }
      else if (t === 'select') { drawUM.push(layer.canvas); clearOverlay(); }
    }
    function onMove(e) {
      if (!isPointerDownRef.current) return;
      const pos = getCanvasPos(e, overlay);
      const t = toolRef.current, layer = activeLayer();
      if (['brush', 'pencil', 'airbrush', 'eraser'].includes(t)) { if (layer) { drawDab(layer.ctx, lastPosRef.current, pos, t); lastPosRef.current = pos; } }
      else if (['rect', 'ellipse', 'line'].includes(t)) { clearOverlay(); drawShapePreview(overlay.getContext('2d'), startPosRef.current, pos, t); }
      else if (t === 'select') { clearOverlay(); drawMarqueePreview(overlay.getContext('2d'), startPosRef.current, pos); }
    }
    function onUp(e) {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      const pos = getCanvasPos(e, overlay);
      const t = toolRef.current, layer = activeLayer();
      if (['rect', 'ellipse', 'line'].includes(t) && layer) { clearOverlay(); commitShape(layer.ctx, startPosRef.current, pos, t); }
      else if (t === 'select' && layer) {
        clearOverlay();
        const r = normRect(startPosRef.current, pos);
        if (r.w > 2 && r.h > 2) layer.ctx.clearRect(r.x, r.y, r.w, r.h);
      }
    }
    overlay.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { overlay.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [activeLayerId]);

  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); drawUM.undo(); return; }
        if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') { e.preventDefault(); drawUM.redo(); return; }
      }
      const map = { b: 'brush', p: 'pencil', g: 'airbrush', e: 'eraser', v: 'select', r: 'rect', o: 'ellipse', l: 'line' };
      if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
      if (e.key === '[') setSize((s) => Math.max(1, s - 2));
      if (e.key === ']') setSize((s) => Math.min(80, s + 2));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawUM]);

  useEffect(() => { if (stageInnerRef.current) stageInnerRef.current.style.transform = `scale(${zoom})`; }, [zoom]);

  function compositeToCanvas() {
    const off = document.createElement('canvas'); off.width = DRAW_W; off.height = DRAW_H;
    const ctx = off.getContext('2d');
    layersRef.current.forEach((l) => { if (!l.visible) return; ctx.globalAlpha = l.opacity; ctx.drawImage(l.canvas, 0, 0); });
    ctx.globalAlpha = 1;
    return off;
  }
  function exportPNG() {
    compositeToCanvas().toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'illust-studio-drawing.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }
  async function save() {
    setSaving(true); setNotice('');
    try {
      const thumbCanvas = document.createElement('canvas'); thumbCanvas.width = 240; thumbCanvas.height = 160;
      thumbCanvas.getContext('2d').drawImage(compositeToCanvas(), 0, 0, 240, 160);
      const payload = {
        title: 'Illustration', type: 'illustration', width: DRAW_W, height: DRAW_H,
        thumbnail: thumbCanvas.toDataURL(),
        layers: layersRef.current.map((l) => ({ name: l.name, dataUrl: l.canvas.toDataURL(), visible: l.visible, opacity: l.opacity })),
      };
      await client.post('/projects', payload);
      setNotice('Saved.');
    } catch (err) { setNotice(err.response?.data?.message || 'Could not save.'); }
    finally { setSaving(false); }
  }

  useEffect(() => {
    if (projectId && projectId !== 'new') {
      const loadProject = async () => {
        try {
          const res = await client.get(`/projects/${projectId}`);
          const project = res.data.project;

          layersRef.current = [];

          project.layers.forEach((layerData) => {
            const canvas = document.createElement('canvas');
            canvas.width = project.width || DRAW_W;
            canvas.height = project.height || DRAW_H;
            const ctx = canvas.getContext('2d');

            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
            };
            img.src = layerData.dataUrl; 

            const layer = {
              id: 'L' + layerCounterRef.current++,
              name: layerData.name || 'Layer',
              canvas,
              ctx,
              visible: layerData.visible !== undefined ? layerData.visible : true,
              opacity: layerData.opacity || 1,
            };
            layersRef.current.push(layer);
          });

          if (layersRef.current.length > 0) {
            setActiveLayerId(layersRef.current[layersRef.current.length - 1].id);
          }

          renderLayerStack();
          setLayersVersion(v => v + 1);
        } catch (err) {
          console.error('Failed to load project', err);
          setNotice('Could not load project');
        }
      };
      loadProject();
    } else {
      if (layersRef.current.length === 0) {
        addLayer('Layer 1');
      }
    }
  }, [projectId]); 
  const layersForUI = [...layersRef.current].reverse();
  const iconBtn = 'w-4 h-4';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex-wrap">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono uppercase text-neutral-400">Size</span>
          <input type="range" min={1} max={80} value={size} onChange={(e) => setSize(+e.target.value)} />
          <span className="font-mono text-neutral-500 w-8">{size}px</span>
        </div>
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input type="checkbox" checked={shapeFill} onChange={(e) => setShapeFill(e.target.checked)} /> Fill
        </label>
        <button className="btn btn-icon" onClick={() => drawUM.undo()}><UndoIcon className={iconBtn} /></button>
        <button className="btn btn-icon" onClick={() => drawUM.redo()}><RedoIcon className={iconBtn} /></button>
        <button className="btn !py-1 !px-2.5 text-xs" onClick={() => setZoomState((z) => Math.max(0.25, z - 0.1))}>−</button>
        <span className="font-mono text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button className="btn !py-1 !px-2.5 text-xs" onClick={() => setZoomState((z) => Math.min(3, z + 0.1))}>+</button>
        <button className="btn !py-1 text-xs" onClick={() => setZoomState(1)}>Fit</button>
        <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    setIsPanActive(prev => !prev);
  }}
  className={`px-3 py-1 rounded text-xs transition ${
    isPanActive ? 'bg-[#14cba8] text-black font-semibold' : 'bg-neutral-800 text-neutral-300'
  }`}
>
  
  ✋ Pan
</button>

<button 
  onClick={() => setRotation(prev => (prev - 90) % 360)} 
  className="px-3 py-1 bg-neutral-800 hover:bg-[#14cba8] hover:text-black rounded text-xs text-neutral-300 transition"
  title="Rotate Left"
>
  ↺ -90°
</button>

<button 
  onClick={() => setRotation(prev => (prev + 90) % 360)} 
  className="px-3 py-1 bg-neutral-800 hover:bg-[#14cba8] hover:text-black rounded text-xs text-neutral-300 transition"
  title="Rotate Right"
>
  ↻ +90°
</button>
        <div className="flex-1" />
        {notice && <span className="text-xs text-neutral-500">{notice}</span>}
        <button disabled={saving} className="btn !py-1 text-xs" onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-primary !py-1 text-xs" onClick={exportPNG}>Export PNG</button>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-14 border-r border-neutral-200 dark:border-neutral-800 flex flex-col items-center py-3 gap-1 overflow-y-auto flex-none">
          {TOOLS.map((t) => (
            <button key={t.id} title={t.id} onClick={() => setTool(t.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool === t.id ? 'bg-teal-600 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
              <t.Icon className="w-4.5 h-4.5" />
            </button>
          ))}
          <div className="w-6 border-t border-neutral-200 dark:border-neutral-800 my-1" />
          {SHAPE_TOOLS.map((t) => (
            <button key={t.id} title={t.id} onClick={() => setTool(t.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool === t.id ? 'bg-teal-600 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
              <t.Icon className="w-4.5 h-4.5" />
            </button>
          ))}
          <div className="w-6 border-t border-neutral-200 dark:border-neutral-800 my-1" />
          <button title="select" onClick={() => setTool('select')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool === 'select' ? 'bg-teal-600 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
            <SelectIcon className="w-4.5 h-4.5" />
          </button>
        </div>

        
      <div className="flex-1 overflow-auto flex items-center justify-center p-6">
        <div ref={stageInnerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative shadow-xl checker" 
          style={{ 
            width: DRAW_W, 
            height: DRAW_H, 
            transformOrigin: 'center center',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) rotate(${rotation}deg)`,
            transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
            cursor: isPanActive ? (isDragging.current ? 'grabbing' : 'grab') : 'default'
          }}
        >
          <div ref={layersMountRef} className="absolute inset-0" />
          <canvas 
            ref={overlayRef} 
            width={DRAW_W} 
            height={DRAW_H} 
            className="absolute inset-0" 
            style={{ 
              touchAction: 'none',
              pointerEvents: isPanActive ? 'none' : 'auto'
            }} 
          />
        </div>
      </div>

        <div className="w-64 border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-y-auto flex-none">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <p className="text-xs font-mono uppercase text-neutral-400 mb-3">Color</p>
            <ColorWheel color={color} onChange={setColor} size={72} />
          </div>
          <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
            <p className="text-xs font-mono uppercase text-neutral-400">Layers</p>
            <button className="btn btn-icon" onClick={() => addLayer()}><PlusIcon className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex-1 p-2 flex flex-col gap-2">
            {layersForUI.map((l) => (
              <div key={l.id} onClick={() => setActiveLayerId(l.id)}
                className={`rounded-lg p-2 cursor-pointer border ${l.id === activeLayerId ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-transparent bg-neutral-50 dark:bg-neutral-800'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={(e) => { e.stopPropagation(); toggleVisible(l.id); }} className="text-neutral-500">
                    {l.visible ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeOffIcon className="w-3.5 h-3.5" />}
                  </button>
                  <input className="flex-1 min-w-0 bg-transparent text-xs font-medium" defaultValue={l.name}
                    onClick={(e) => e.stopPropagation()} onChange={(e) => renameLayer(l.id, e.target.value)} />
                  <button onClick={(e) => { e.stopPropagation(); duplicateLayer(); }} className="text-neutral-400 hover:text-neutral-700"><DuplicateIcon className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(l.id, 1); }} className="text-neutral-400 hover:text-neutral-700"><ArrowUpIcon className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(l.id, -1); }} className="text-neutral-400 hover:text-neutral-700"><ArrowDownIcon className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteLayer(l.id); }} className="text-red-400 hover:text-red-600"><CloseIcon className="w-3.5 h-3.5" /></button>
                </div>
                <input type="range" min={0} max={1} step={0.05} defaultValue={l.opacity}
                  onClick={(e) => e.stopPropagation()} onChange={(e) => setOpacity(l.id, parseFloat(e.target.value))} className="w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
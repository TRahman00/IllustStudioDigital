import { useEffect, useRef, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ColorWheel from '../components/canvas/ColorWheel.jsx';
import { useUndoManager } from '../components/canvas/useUndoManager.js';
import {
  BrushIcon, PencilIcon, AirbrushIcon, EraserIcon, UndoIcon, RedoIcon,
  PlayIcon, PauseIcon, StopIcon, PlusIcon, DuplicateIcon, CloseIcon, ArrowLeftIcon, ArrowRightIcon,
} from '../components/icons/Icons.jsx';

const ANIM_W = 640, ANIM_H = 420;



const FREE_FRAME_LIMIT = 20;
const FREE_FPS_LIMIT = 12;   // Added for Animation
const TOOLS = [
  { id: 'brush', Icon: BrushIcon },
  { id: 'pencil', Icon: PencilIcon },
  { id: 'airbrush', Icon: AirbrushIcon },
  { id: 'eraser', Icon: EraserIcon },
];

function getCanvasPos(e, canvasEl) {
  const rect = canvasEl.getBoundingClientRect();
  return { x: (e.clientX - rect.left) * (canvasEl.width / rect.width), y: (e.clientY - rect.top) * (canvasEl.height / rect.height) };
}

export default function AnimateStudio() {
  const { user } = useAuth();
  const isPremium = user?.plan === 'premium';
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#14B8A6');
  const [size, setSize] = useState(14);
  const [onionEnabled, setOnionEnabled] = useState(true);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [fps, setFps] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameCount, setFrameCount] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [timelineTick, setTimelineTick] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const toolRef = useRef(tool), colorRef = useRef(color), sizeRef = useRef(size);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const framesRef = useRef([]);
  const currentIndexRef = useRef(0);
  const frameCanvasRef = useRef(null);
  const onionCanvasRef = useRef(null);
  const playCanvasRef = useRef(null);
  const timelineRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const playTimerRef = useRef(null);
  const onionEnabledRef = useRef(true); useEffect(() => { onionEnabledRef.current = onionEnabled; renderOnion(); }, [onionEnabled]);
  const loopEnabledRef = useRef(true); useEffect(() => { loopEnabledRef.current = loopEnabled; }, [loopEnabled]);

  const animUM = useUndoManager();

  function makeBlankCanvas() { const c = document.createElement('canvas'); c.width = ANIM_W; c.height = ANIM_H; return c; }

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

  function saveCurrentFrame() {
    const idx = currentIndexRef.current;
    const ctx = framesRef.current[idx].canvas.getContext('2d');
    ctx.clearRect(0, 0, ANIM_W, ANIM_H);
    ctx.drawImage(frameCanvasRef.current, 0, 0);
    updateTimelineThumb(idx);
  }
  function renderOnion() {
    const ctx = onionCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ANIM_W, ANIM_H);
    const idx = currentIndexRef.current;
    if (onionEnabledRef.current && idx > 0) { ctx.globalAlpha = 0.3; ctx.drawImage(framesRef.current[idx - 1].canvas, 0, 0); ctx.globalAlpha = 1; }
  }
  function loadFrame(idx) {
    const ctx = frameCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ANIM_W, ANIM_H);
    ctx.drawImage(framesRef.current[idx].canvas, 0, 0);
    renderOnion(); setCurrentIndex(idx); highlightTimeline(idx);
  }
  function switchFrame(idx) {
    if (idx === currentIndexRef.current || idx < 0 || idx >= framesRef.current.length) return;
    saveCurrentFrame(); currentIndexRef.current = idx; loadFrame(idx);
  }
  function highlightTimeline(idx) {
    const el = timelineRef.current; if (!el) return;
    [...el.children].forEach((c, i) => c.classList.toggle('!border-teal-500', i === idx));
  }
  function updateTimelineThumb(idx) {
    const el = timelineRef.current; if (!el || !el.children[idx]) return;
    const thumb = el.children[idx].querySelector('canvas');
    thumb.getContext('2d').clearRect(0, 0, 64, 42);
    thumb.getContext('2d').drawImage(framesRef.current[idx].canvas, 0, 0, 64, 42);
  }

  function handleFpsChange(e) {
    const newFps = +e.target.value;
    // If they are a free user and try to go over 12
    if (!isPremium && newFps > FREE_FPS_LIMIT) {
      setFps(FREE_FPS_LIMIT); // Snap back to 12
      setShowUpgradeModal(true); // Open the popup
    } else {
      setFps(newFps); // Allow premium users or valid free values
    }
  }

 function addBlank() { 
  if (!isPremium && framesRef.current.length >= FREE_FRAME_LIMIT) {
    setNotice(`Free plan is limited to ${FREE_FRAME_LIMIT} frames. Upgrade to Premium for more.`);
    return;
  }
  saveCurrentFrame(); 
  framesRef.current.splice(currentIndexRef.current + 1, 0, { canvas: makeBlankCanvas() }); 
  currentIndexRef.current++; 
  setFrameCount(framesRef.current.length); 
  setTimelineTick((t) => t + 1); 
  loadFrame(currentIndexRef.current); 
}

function duplicate() { 
  if (!isPremium && framesRef.current.length >= FREE_FRAME_LIMIT) {
    setNotice(`Free plan is limited to ${FREE_FRAME_LIMIT} frames. Upgrade to Premium for more.`);
    return;
  }
  saveCurrentFrame(); 
  const c = makeBlankCanvas(); 
  c.getContext('2d').drawImage(framesRef.current[currentIndexRef.current].canvas, 0, 0); 
  framesRef.current.splice(currentIndexRef.current + 1, 0, { canvas: c }); 
  currentIndexRef.current++; 
  setFrameCount(framesRef.current.length); 
  setTimelineTick((t) => t + 1); 
  loadFrame(currentIndexRef.current); 
}
  function del() { if (framesRef.current.length <= 1) return; framesRef.current.splice(currentIndexRef.current, 1); if (currentIndexRef.current >= framesRef.current.length) currentIndexRef.current = framesRef.current.length - 1; setFrameCount(framesRef.current.length); setTimelineTick((t) => t + 1); loadFrame(currentIndexRef.current); }
  function move(dir) { const newIdx = currentIndexRef.current + dir; if (newIdx < 0 || newIdx >= framesRef.current.length) return; saveCurrentFrame(); const tmp = framesRef.current[currentIndexRef.current]; framesRef.current[currentIndexRef.current] = framesRef.current[newIdx]; framesRef.current[newIdx] = tmp; currentIndexRef.current = newIdx; setTimelineTick((t) => t + 1); loadFrame(newIdx); }

  useEffect(() => {
    const canvas = frameCanvasRef.current;
    function onDown(e) {
      isDrawingRef.current = true;
      lastPosRef.current = getCanvasPos(e, canvas);
      animUM.push(framesRef.current[currentIndexRef.current].canvas);
      saveCurrentFrame();
      drawDab(canvas.getContext('2d'), lastPosRef.current, lastPosRef.current, toolRef.current);
    }
    function onMove(e) {
      if (!isDrawingRef.current) return;
      const pos = getCanvasPos(e, canvas);
      drawDab(canvas.getContext('2d'), lastPosRef.current, pos, toolRef.current);
      lastPosRef.current = pos;
    }
    function onUp() { if (!isDrawingRef.current) return; isDrawingRef.current = false; saveCurrentFrame(); }
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { canvas.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, []);

  function play() {
    if (isPlaying) return;
    saveCurrentFrame();
    setIsPlaying(true);
    let idx = currentIndexRef.current;
    const playCtx = playCanvasRef.current.getContext('2d');
    playCtx.clearRect(0, 0, ANIM_W, ANIM_H); playCtx.drawImage(framesRef.current[idx].canvas, 0, 0);
    playTimerRef.current = setInterval(() => {
      idx++;
      if (idx >= framesRef.current.length) { if (!loopEnabledRef.current) { stopPlay(); return; } idx = 0; }
      playCtx.clearRect(0, 0, ANIM_W, ANIM_H); playCtx.drawImage(framesRef.current[idx].canvas, 0, 0);
      currentIndexRef.current = idx; setCurrentIndex(idx); highlightTimeline(idx);
    }, 1000 / Math.max(1, fps));
  }
  function stopPlay() { clearInterval(playTimerRef.current); setIsPlaying(false); loadFrame(currentIndexRef.current); }
  useEffect(() => { if (isPlaying) { clearInterval(playTimerRef.current); play(); } /* eslint-disable-next-line */ }, [fps]);

  function downloadFrame() {
    saveCurrentFrame();
    framesRef.current[currentIndexRef.current].canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `illust-studio-frame-${currentIndexRef.current + 1}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }
  function exportSheet() {
    saveCurrentFrame();
    const sheet = document.createElement('canvas'); sheet.width = ANIM_W * framesRef.current.length; sheet.height = ANIM_H;
    const ctx = sheet.getContext('2d');
    framesRef.current.forEach((f, i) => ctx.drawImage(f.canvas, i * ANIM_W, 0));
    sheet.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'illust-studio-animation-sheet.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }
  async function save() {
    setSaving(true); setNotice(''); saveCurrentFrame();
    try {
      const payload = { title: 'Animation', type: 'animation', width: ANIM_W, height: ANIM_H, fps, thumbnail: framesRef.current[0].canvas.toDataURL(), frames: framesRef.current.map((f) => ({ dataUrl: f.canvas.toDataURL() })) };
      await client.post('/projects', payload);
      setNotice('Saved.');
    } catch (err) { setNotice(err.response?.data?.message || 'Could not save.'); }
    finally { setSaving(false); }
  }

  useEffect(() => {
    framesRef.current = [{ canvas: makeBlankCanvas() }];
    currentIndexRef.current = 0;
    setFrameCount(1);
    loadFrame(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex-wrap">
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)} className={`w-8 h-8 rounded-md flex items-center justify-center ${tool === t.id ? 'bg-teal-600 text-white' : 'text-neutral-500'}`}>
              <t.Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono uppercase text-neutral-400">Size</span>
          <input type="range" min={1} max={80} value={size} onChange={(e) => setSize(+e.target.value)} />
          <span className="font-mono text-neutral-500 w-8">{size}px</span>
        </div>
        <ColorWheel color={color} onChange={setColor} size={36} />
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input type="checkbox" checked={onionEnabled} onChange={(e) => setOnionEnabled(e.target.checked)} /> Onion skin
        </label>
        <button className="btn btn-icon" onClick={() => animUM.undo()}><UndoIcon className="w-4 h-4" /></button>
        <button className="btn btn-icon" onClick={() => animUM.redo()}><RedoIcon className="w-4 h-4" /></button>
        <div className="flex-1" />
        {notice && <span className="text-xs text-neutral-500">{notice}</span>}
        <button className="btn !py-1 text-xs" onClick={downloadFrame}>Download frame</button>
        <button disabled={saving} className="btn !py-1 text-xs" onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-primary !py-1 text-xs" onClick={exportSheet}>Export sprite sheet</button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="relative checker shadow-xl" style={{ width: ANIM_W, height: ANIM_H }}>
          <canvas ref={onionCanvasRef} width={ANIM_W} height={ANIM_H} className="absolute inset-0 pointer-events-none" />
          <canvas ref={frameCanvasRef} width={ANIM_W} height={ANIM_H} className="absolute inset-0" style={{ display: isPlaying ? 'none' : 'block', touchAction: 'none' }} />
          <canvas ref={playCanvasRef} width={ANIM_W} height={ANIM_H} className="absolute inset-0 pointer-events-none" style={{ display: isPlaying ? 'block' : 'none' }} />
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 border-t border-b border-neutral-200 dark:border-neutral-800">
        <button className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center" onClick={() => (isPlaying ? stopPlay() : play())}>
          {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
        </button>
        <button className="btn btn-icon" onClick={() => { stopPlay(); currentIndexRef.current = 0; loadFrame(0); }}><StopIcon className="w-4 h-4" /></button>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono uppercase text-neutral-400">FPS</span>
          <input type="range" min={1} max={24} value={fps} onChange={handleFpsChange} />
          <span>{fps}</span>
        </div>
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input type="checkbox" checked={loopEnabled} onChange={(e) => setLoopEnabled(e.target.checked)} /> Loop
        </label>
        <span className="ml-auto font-mono text-xs text-neutral-500">Frame {currentIndex + 1} / {frameCount}</span>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto">
        <div className="flex gap-1 flex-none">
          <button className="btn btn-icon" onClick={addBlank}><PlusIcon className="w-4 h-4" /></button>
          <button className="btn btn-icon" onClick={duplicate}><DuplicateIcon className="w-4 h-4" /></button>
          <button className="btn btn-icon text-red-500" onClick={del}><CloseIcon className="w-4 h-4" /></button>
          <button className="btn btn-icon" onClick={() => move(-1)}><ArrowLeftIcon className="w-4 h-4" /></button>
          <button className="btn btn-icon" onClick={() => move(1)}><ArrowRightIcon className="w-4 h-4" /></button>
        </div>
        <div ref={timelineRef} className="flex gap-2 overflow-x-auto" key={timelineTick}>
          {framesRef.current.map((f, i) => (
            <div key={i} onClick={() => switchFrame(i)}
              className={`flex-none w-16 rounded-md border-2 cursor-pointer relative ${i === currentIndex ? '!border-teal-500' : 'border-neutral-200 dark:border-neutral-700'}`}>
              <canvas width={64} height={42} className="block checker" ref={(node) => { if (node) node.getContext('2d').drawImage(f.canvas, 0, 0, 64, 42); }} />
              <span className="absolute bottom-0 right-1 text-[9px] bg-black/60 text-white px-1 rounded">{i + 1}</span>

            </div>
          ))}
        </div>
      </div>
      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#070C0B] border border-neutral-700 rounded-2xl p-8 relative m-4">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl">✕</button>
            
            <h2 className="text-3xl font-display font-semibold mb-2">Upgrade to Premium</h2>
            <p className="text-teal-400 mb-8">Unlock advanced animation features and perks</p>
            
            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Free Card */}
              <div className="border border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold mb-2">Free Artist</h3>
                <div className="text-3xl font-bold mb-2"><span className="text-teal-400">$0</span> <span className="text-sm font-normal">/ month</span></div>
                <p className="text-sm text-neutral-400 mb-4">Basic tools & 15 layers included</p>
                <button className="btn w-full bg-neutral-800 text-neutral-400 cursor-not-allowed" disabled>Current Plan</button>
              </div>

              {/* Monthly Plan (Highlighted) */}
              <div className="border-2 border-teal-500 rounded-xl p-6 flex flex-col items-center justify-center text-center relative">
                <span className="absolute -top-3 bg-teal-500 text-black text-xs px-2 py-1 rounded">MOST POPULAR</span>
                <h3 className="text-xl font-semibold mb-2">Monthly Plan</h3>
                <div className="text-3xl font-bold mb-2"><span className="text-teal-400">$7</span> <span className="text-sm font-normal">/ month</span></div>
                <p className="text-sm text-neutral-400 mb-4">Extended limits & cloud backup</p>
                <button className="btn w-full bg-teal-600 text-white border-teal-600">Selected</button>
              </div>

              {/* Yearly Plan */}
              <div className="border border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center text-center relative">
                <span className="absolute -top-3 bg-teal-500 text-black text-xs px-2 py-1 rounded">Save $19</span>
                <h3 className="text-xl font-semibold mb-2">Yearly Plan</h3>
                <div className="text-3xl font-bold mb-2"><span className="text-teal-400">$65</span> <span className="text-sm font-normal">/ year</span></div>
                <p className="text-sm text-neutral-400 mb-4">Best value for serious creators</p>
                <button className="btn w-full border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-black">Select Yearly</button>
              </div>
            </div>

            {/* Bottom PayPal Button */}
            <div className="mt-8 flex justify-center">
              <button className="btn btn-primary text-lg py-3 px-10">Pay Through PayPal ($7)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
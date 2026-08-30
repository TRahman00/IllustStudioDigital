import { useEffect, useRef, useState } from 'react';
import './Studio.css';
import './AIFeatures.css';
import { useNavigate } from 'react-router-dom'; // <--- Added for save URL update
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
const FREE_FPS_LIMIT = 12;
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

export default function AnimateStudio({ projectId }) {
  const navigate = useNavigate();
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

  // --- New AI In-Between State ---
  const [showAIModal, setShowAIModal] = useState(false);
  const [kf1Index, setKf1Index] = useState(0);
  const [kf2Index, setKf2Index] = useState(0);
  const [generatedFrames, setGeneratedFrames] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frameList, setFrameList] = useState([]);

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
    [...el.children].forEach((c, i) => c.classList.toggle('active', i === idx));
  }
  function updateTimelineThumb(idx) {
    const el = timelineRef.current; if (!el || !el.children[idx]) return;
    const thumb = el.children[idx].querySelector('canvas');
    thumb.getContext('2d').clearRect(0, 0, 64, 42);
    thumb.getContext('2d').drawImage(framesRef.current[idx].canvas, 0, 0, 64, 42);
  }

  function handleFpsChange(e) {
    const newFps = +e.target.value;
    if (!isPremium && newFps > FREE_FPS_LIMIT) {
      setFps(FREE_FPS_LIMIT);
      setShowUpgradeModal(true);
    } else {
      setFps(newFps);
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

  // INITIALIZE: If projectId, load frames, otherwise create a blank frame
  useEffect(() => {
    if (projectId) {
      client.get(`/projects/${projectId}`).then(res => {
        const project = res.data.project;
        framesRef.current = [];
        currentIndexRef.current = 0;
        if (project.frames && project.frames.length > 0) {
          project.frames.forEach(frameData => {
            const c = document.createElement('canvas'); c.width = ANIM_W; c.height = ANIM_H;
            const img = new Image();
            img.onload = () => {
              c.getContext('2d').drawImage(img, 0, 0);
              framesRef.current.push({ canvas: c });
              if (framesRef.current.length === project.frames.length) {
                setFrameCount(framesRef.current.length);
                loadFrame(0);
              }
            };
            img.src = frameData.dataUrl;
          });
        } else {
          framesRef.current = [{ canvas: makeBlankCanvas() }];
          setFrameCount(1);
          loadFrame(0);
        }
        if (project.fps) setFps(project.fps);
      }).catch(err => console.error('Failed to load animation', err));
    } else {
      framesRef.current = [{ canvas: makeBlankCanvas() }];
      currentIndexRef.current = 0;
      setFrameCount(1);
      loadFrame(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // SAVE
  async function save() {
    setSaving(true); setNotice(''); saveCurrentFrame();
    try {
      const payload = { title: 'Animation', type: 'animation', width: ANIM_W, height: ANIM_H, fps, thumbnail: framesRef.current[0].canvas.toDataURL(), frames: framesRef.current.map((f) => ({ dataUrl: f.canvas.toDataURL() })) };
      if (projectId) {
        await client.put(`/projects/${projectId}`, payload);
      } else {
        const res = await client.post('/projects', payload);
        // Update the URL so future saves don't create duplicates!
        if (res.data && res.data.project) navigate(`/studio/${res.data.project._id}?tab=animate`, { replace: true });
      }
      setNotice('Saved.');
    } catch (err) { setNotice(err.response?.data?.message || 'Could not save.'); }
    finally { setSaving(false); }
  }

  // --- AI In-Between Functions ---
  const openAIModal = () => {
    if (!isPremium) {
      setNotice("AI In-Betweening is a Premium feature!");
      setShowUpgradeModal(true);
      return;
    }
    // Set initial keyframes
    const lastIndex = framesRef.current.length - 1;
    setKf1Index(0);
    setKf2Index(lastIndex);
    setFrameList(framesRef.current.map((_, i) => i));
    setGeneratedFrames([]);
    setProgress(0);
    setShowAIModal(true);
  };

  const generateFrames = () => {
    if (kf1Index === kf2Index) return alert("Please select two different keyframes!");
    setGenerating(true);
    setProgress(0);

    const totalSteps = 5;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const t = currentStep / totalSteps;
      const canvas1 = framesRef.current[kf1Index].canvas;
      const canvas2 = framesRef.current[kf2Index].canvas;

      const newCanvas = document.createElement('canvas');
      newCanvas.width = ANIM_W;
      newCanvas.height = ANIM_H;
      const ctx = newCanvas.getContext('2d');
      ctx.globalAlpha = 1 - t;
      ctx.drawImage(canvas1, 0, 0);
      ctx.globalAlpha = t;
      ctx.drawImage(canvas2, 0, 0);
      ctx.globalAlpha = 1;

      setGeneratedFrames(prev => [...prev, { dataUrl: newCanvas.toDataURL() }]);
      setProgress(Math.round((currentStep / totalSteps) * 100));

      if (currentStep === totalSteps) {
        clearInterval(interval);
        setGenerating(false);
      }
    }, 300);
  };

  const addGeneratedToTimeline = () => {
    generatedFrames.forEach((frameData) => {
      const c = document.createElement('canvas');
      c.width = ANIM_W;
      c.height = ANIM_H;
      const img = new Image();
      img.onload = () => {
        c.getContext('2d').drawImage(img, 0, 0);
        framesRef.current.splice(currentIndexRef.current + 1, 0, { canvas: c });
        setFrameCount(framesRef.current.length);
        setTimelineTick((t) => t + 1);
      };
      img.src = frameData.dataUrl;
    });
    setShowAIModal(false);
    setNotice("AI frames added to timeline!");
  };

  return (
    <div className="studio-page anim-layout" data-theme={user?.theme}>
      {/* TOOLBAR */}
      <div className="anim-toolbar">
        <div className="anim-tool-btns">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)} className={`tool-btn ${tool === t.id ? 'active' : ''}`}>
              <t.Icon />
            </button>
          ))}
        </div>
        <div className="slider-group">
          <span className="field-label">Size</span>
          <input type="range" min={1} max={80} value={size} onChange={(e) => setSize(+e.target.value)} />
          <span className="val">{size}px</span>
        </div>
        <ColorWheel color={color} onChange={setColor} size={36} />
        <div className="sep"></div>
        <label className="slider-group" style={{cursor: 'pointer'}}>
          <input type="checkbox" checked={onionEnabled} onChange={(e) => setOnionEnabled(e.target.checked)} />
          <span className="field-label">Onion skin</span>
        </label>
        <div className="sep"></div>
        <button className="btn btn-icon" onClick={() => animUM.undo()}><UndoIcon /></button>
        <button className="btn btn-icon" onClick={() => animUM.redo()}><RedoIcon /></button>
        <div style={{flex: 1}}></div>
        {/* New AI In-Between Button */}
        <button className="btn" onClick={openAIModal} style={{ background: 'var(--purple-100)', color: 'var(--purple-600)', border: '1px solid var(--purple-600)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
          AI In-Between
        </button>
        <button className="btn" onClick={downloadFrame}>Download frame</button>
        <button disabled={saving} className="btn btn-primary" onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-primary" onClick={exportSheet}>Export sprite sheet</button>
      </div>

      {/* STAGE */}
      <div className="anim-stage-area">
        <div className="anim-stage" style={{ width: ANIM_W, height: ANIM_H }}>
          <canvas ref={onionCanvasRef} width={ANIM_W} height={ANIM_H} style={{ position: 'absolute', inset: 0, width: ANIM_W, height: ANIM_H }} />
          <canvas ref={frameCanvasRef} width={ANIM_W} height={ANIM_H} style={{ position: 'absolute', inset: 0, width: ANIM_W, height: ANIM_H, display: isPlaying ? 'none' : 'block', touchAction: 'none' }} />
          <canvas ref={playCanvasRef} width={ANIM_W} height={ANIM_H} style={{ position: 'absolute', inset: 0, width: ANIM_W, height: ANIM_H, display: isPlaying ? 'block' : 'none', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* PLAYBACK BAR */}
      <div className="playback-bar">
        <button className="btn btn-icon btn-primary" onClick={() => (isPlaying ? stopPlay() : play())}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="btn btn-icon" onClick={() => { stopPlay(); currentIndexRef.current = 0; loadFrame(0); }}><StopIcon /></button>
        <div className="slider-group">
          <span className="field-label">FPS</span>
          <input type="range" min={1} max={24} value={fps} onChange={handleFpsChange} />
          <span className="val">{fps}</span>
        </div>
        <label className="slider-group" style={{cursor: 'pointer'}}>
          <input type="checkbox" checked={loopEnabled} onChange={(e) => setLoopEnabled(e.target.checked)} />
          <span className="field-label">Loop</span>
        </label>
        <span className="frame-counter">Frame {currentIndex + 1} / {frameCount}</span>
      </div>

      {/* TIMELINE */}
      <div className="timeline-row">
        <div className="frame-actions">
          <button className="btn btn-icon" onClick={addBlank}><PlusIcon /></button>
          <button className="btn btn-icon" onClick={duplicate}><DuplicateIcon /></button>
          <button className="btn btn-icon" onClick={del}><CloseIcon /></button>
          <button className="btn btn-icon" onClick={() => move(-1)}><ArrowLeftIcon /></button>
          <button className="btn btn-icon" onClick={() => move(1)}><ArrowRightIcon /></button>
        </div>
        <div className="timeline" ref={timelineRef} key={timelineTick}>
          {framesRef.current.map((f, i) => (
            <div key={i} className={`tl-item ${i === currentIndex ? 'active' : ''}`} onClick={() => switchFrame(i)}>
              <canvas width={64} height={42} />
              <span>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI In-Between Modal */}
      {showAIModal && (
        <div className="ai-modal-overlay open">
          <div className="ai-inbetween-modal">
            <div className="ib-modal-header">
              <h3>⚡ AI In-Betweening</h3>
              <button className="ib-close-btn" onClick={() => setShowAIModal(false)}>×</button>
            </div>
            <div className="ib-modal-body">
              <div className="ib-keyframes-row">
                <div className="ib-kf-select">
                  <label>Keyframe 1</label>
                  <select value={kf1Index} onChange={(e) => setKf1Index(Number(e.target.value))}>
                    {frameList.map((idx) => <option key={idx} value={idx}>Frame {idx + 1}</option>)}
                  </select>
                </div>
                <div className="ib-arrow-sep">→</div>
                <div className="ib-kf-select">
                  <label>Keyframe 2</label>
                  <select value={kf2Index} onChange={(e) => setKf2Index(Number(e.target.value))}>
                    {frameList.map((idx) => <option key={idx} value={idx}>Frame {idx + 1}</option>)}
                  </select>
                </div>
              </div>
              <div className="ib-generated-section">
                <span className="ib-generated-label">Generated In-Between Frames</span>
                <div className="ib-generated-frames">
                  {generatedFrames.map((f, i) => (
                    <div className="ib-frame-thumb" key={i}>
                      <img src={f.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <span>{i + 1}</span>
                    </div>
                  ))}
                </div>
                {generating && (
                  <>
                    <div className="ib-progress-bar"><i style={{ width: `${progress}%` }}></i></div>
                    <div className="ib-progress-text">Generating... {progress}%</div>
                  </>
                )}
              </div>
            </div>
            <div className="ib-modal-actions">
              <button className="btn" onClick={() => setShowAIModal(false)}>Cancel</button>
              <button className="btn ib-generate-btn" onClick={generateFrames} disabled={generating}>Generate</button>
              {generatedFrames.length > 0 && <button className="btn btn-primary" onClick={addGeneratedToTimeline}>Add to Timeline</button>}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#070C0B] border border-neutral-700 rounded-2xl p-8 relative m-4">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl">✕</button>
            <h2 className="text-3xl font-display font-semibold mb-2">Upgrade to Premium</h2>
            <p className="text-teal-400 mb-8">Unlock advanced animation features and perks</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold mb-2">Free Artist</h3>
                <div className="text-3xl font-bold mb-2"><span className="text-teal-400">$0</span> <span className="text-sm font-normal">/ month</span></div>
                <p className="text-sm text-neutral-400 mb-4">Basic tools & 15 layers included</p>
                <button className="btn w-full bg-neutral-800 text-neutral-400 cursor-not-allowed" disabled>Current Plan</button>
              </div>
              <div className="border-2 border-teal-500 rounded-xl p-6 flex flex-col items-center justify-center text-center relative">
                <span className="absolute -top-3 bg-teal-500 text-black text-xs px-2 py-1 rounded">MOST POPULAR</span>
                <h3 className="text-xl font-semibold mb-2">Monthly Plan</h3>
                <div className="text-3xl font-bold mb-2"><span className="text-teal-400">$7</span> <span className="text-sm font-normal">/ month</span></div>
                <p className="text-sm text-neutral-400 mb-4">Extended limits & cloud backup</p>
                <button className="btn w-full bg-teal-600 text-white border-teal-600">Selected</button>
              </div>
              <div className="border border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center text-center relative">
                <span className="absolute -top-3 bg-teal-500 text-black text-xs px-2 py-1 rounded">Save $19</span>
                <h3 className="text-xl font-semibold mb-2">Yearly Plan</h3>
                <div className="text-3xl font-bold mb-2"><span className="text-teal-400">$65</span> <span className="text-sm font-normal">/ year</span></div>
                <p className="text-sm text-neutral-400 mb-4">Best value for serious creators</p>
                <button className="btn w-full border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-black">Select Yearly</button>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button className="btn btn-primary text-lg py-3 px-10">Pay Through PayPal ($7)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
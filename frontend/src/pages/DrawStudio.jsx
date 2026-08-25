import { useEffect, useRef, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx'; // <--- ADDED IMPORT
import ColorWheel from '../components/canvas/ColorWheel.jsx';
import { useUndoManager } from '../components/canvas/useUndoManager.js';
import {
  BrushIcon, PencilIcon, AirbrushIcon, EraserIcon, RectIcon, EllipseIcon, LineIcon, SelectIcon,
  UndoIcon, RedoIcon, EyeIcon, EyeOffIcon, DuplicateIcon, ArrowUpIcon, ArrowDownIcon, CloseIcon, PlusIcon,
  HandIcon
} from '../components/icons/Icons.jsx';

const DRAW_W = 900, DRAW_H = 600;
const BLEND_MODES = [
  { id: 'source-over', label: 'Normal' },
  { id: 'multiply', label: 'Multiply' },
  { id: 'screen', label: 'Screen' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'darken', label: 'Darken' },
  { id: 'lighten', label: 'Lighten' },
  { id: 'color-dodge', label: 'Color Dodge' },
  { id: 'color-burn', label: 'Color Burn' },
  { id: 'hard-light', label: 'Hard Light' },
  { id: 'soft-light', label: 'Soft Light' }
];

const TOOLS = [
  { id: 'brush', Icon: BrushIcon },
  { id: 'pencil', Icon: PencilIcon },
  { id: 'airbrush', Icon: AirbrushIcon },
  { id: 'eraser', Icon: EraserIcon },
  { id: 'pan', Icon: HandIcon }, 
];
const SHAPE_TOOLS = [
  { id: 'rect', Icon: RectIcon },
  { id: 'ellipse', Icon: EllipseIcon },
  { id: 'line', Icon: LineIcon },
];

const HANDLE_HIT_RADIUS = 10;
const ROTATE_STALK = 28;
const MAX_SKEW_RAD = 1.3;
const MIN_SCALE = 0.05;
const CORNER_SIGN = {
  'scale-tl': [-1, -1], 'scale-tr': [1, -1], 'scale-bl': [-1, 1], 'scale-br': [1, 1],
};

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
export default function DrawStudio() {
  const [tool, setToolState] = useState('brush');
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [color, setColor] = useState('#14B8A6');
  const [size, setSize] = useState(14);
  const [shapeFill, setShapeFill] = useState(true);
  const [zoom, setZoomState] = useState(1);
  const [layersVersion, setLayersVersion] = useState(0);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [hasSelection, setHasSelection] = useState(false);

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
  const lastPanPosRef = useRef(null);

  const transformSelRef = useRef(null);
  const dragModeRef = useRef(null);
  const dragStartRef = useRef(null);

  const drawUM = useUndoManager();
  
  // --- ADDED: 15 LAYER LIMIT LOGIC ---
  const { user } = useAuth();
  const isPremium = user?.plan === 'premium';
  const FREE_LAYER_LIMIT = 15;

  function activeLayer() { return layersRef.current.find((l) => l.id === activeLayerId); }

  function setTool(id) {
    if (tool === 'select' && id !== 'select' && transformSelRef.current) commitTransform();
    setToolState(id);
  }

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
  
  // --- UPDATED: addLayer with Limit Check ---
  function addLayer(name) {
    if (!isPremium && layersRef.current.length >= FREE_LAYER_LIMIT) {
      setNotice(`Free plan is limited to ${FREE_LAYER_LIMIT} layers. Upgrade to Premium for unlimited layers.`);
      return;
    }
    const c = document.createElement('canvas'); c.width = DRAW_W; c.height = DRAW_H;
    const layer = { 
      id: 'L' + layerCounterRef.current++, name: name || `Layer ${layersRef.current.length + 1}`, 
      canvas: c, ctx: c.getContext('2d'), visible: true, opacity: 1,
      blendMode: 'source-over', clipped: false, maskDataUrl: null // Initialize Faria's features
    };
    layersRef.current.push(layer);
    setActiveLayerId(layer.id);
    renderLayerStack(); setLayersVersion((v) => v + 1);
    return layer;
  }

  // --- UPDATED: duplicateLayer with Limit Check ---
  function duplicateLayer() {
    const src = activeLayer(); if (!src) return;
    if (!isPremium && layersRef.current.length >= FREE_LAYER_LIMIT) {
      setNotice(`Free plan is limited to ${FREE_LAYER_LIMIT} layers. Upgrade to Premium for unlimited layers.`);
      return;
    }
    const idx = layersRef.current.indexOf(src);
    const c = document.createElement('canvas'); c.width = DRAW_W; c.height = DRAW_H;
    c.getContext('2d').drawImage(src.canvas, 0, 0);
    const layer = { 
      id: 'L' + layerCounterRef.current++, name: src.name + ' copy', canvas: c, ctx: c.getContext('2d'), 
      visible: true, opacity: src.opacity, 
      blendMode: src.blendMode, clipped: src.clipped, maskDataUrl: src.maskDataUrl // Copy Faria's features
    };
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

  // --- Faria's Layer Functions ---
  function updateLayerBlendMode(layerId, mode) {
    const l = layersRef.current.find((x) => x.id === layerId);
    if (l) { l.blendMode = mode; renderLayerStack(); }
  }
  function toggleLayerClipping(layerId) {
    const l = layersRef.current.find((x) => x.id === layerId);
    if (l) { l.clipped = !l.clipped; renderLayerStack(); }
  }
  function addLayerMask(layerId) {
    const l = layersRef.current.find((x) => x.id === layerId);
    if (l) {
      // Create a blank mask (all white, so it reveals everything initially)
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = DRAW_W; maskCanvas.height = DRAW_H;
      const maskCtx = maskCanvas.getContext('2d');
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, DRAW_W, DRAW_H);
      l.maskDataUrl = maskCanvas.toDataURL();
      setLayersVersion(v => v + 1);
    }
  }
  function removeLayerMask(layerId) {
    const l = layersRef.current.find((x) => x.id === layerId);
    if (l) { l.maskDataUrl = null; setLayersVersion(v => v + 1); }
  }

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

  // ============================= TRANSFORM TOOL =============================
  function getCenter(sel) { return { x: sel.rect.x + sel.rect.w / 2 + sel.t.tx, y: sel.rect.y + sel.rect.h / 2 + sel.t.ty }; }

  function getBaseMatrix(sel) {
    const c = getCenter(sel);
    let m = new DOMMatrix();
    m = m.translate(c.x, c.y);
    m = m.rotate((sel.t.rotation * 180) / Math.PI);
    return m;
  }
  function getFullMatrix(sel) {
    const { skewX, skewY, scaleX, scaleY } = sel.t;
    let m = getBaseMatrix(sel);
    m = m.multiply(new DOMMatrix([1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0]));
    m = m.scale(scaleX, scaleY);
    return m;
  }
  function computeHandlePoints(sel) {
    const m = getFullMatrix(sel);
    const hw = sel.rect.w / 2, hh = sel.rect.h / 2;
    const pt = (x, y) => { const p = m.transformPoint(new DOMPoint(x, y)); return { x: p.x, y: p.y }; };
    const tl = pt(-hw, -hh), tr = pt(hw, -hh), bl = pt(-hw, hh), br = pt(hw, hh);
    const topMid = pt(0, -hh), bottomMid = pt(0, hh), leftMid = pt(-hw, 0), rightMid = pt(hw, 0);
    const base = getBaseMatrix(sel);
    const o = base.transformPoint(new DOMPoint(0, 0));
    const u = base.transformPoint(new DOMPoint(0, -1));
    const dx = u.x - o.x, dy = u.y - o.y, len = Math.hypot(dx, dy) || 1;
    const rotate = { x: topMid.x + (dx / len) * ROTATE_STALK, y: topMid.y + (dy / len) * ROTATE_STALK };
    return { tl, tr, bl, br, topMid, bottomMid, leftMid, rightMid, rotate };
  }
  function hitTestHandles(pos, sel) {
    const hp = computeHandlePoints(sel);
    const checks = [
      ['scale-tl', hp.tl], ['scale-tr', hp.tr], ['scale-bl', hp.bl], ['scale-br', hp.br],
      ['skewx-top', hp.topMid], ['skewx-bottom', hp.bottomMid],
      ['skewy-left', hp.leftMid], ['skewy-right', hp.rightMid],
      ['rotate', hp.rotate],
    ];
    for (const [name, p] of checks) { if (Math.hypot(pos.x - p.x, pos.y - p.y) <= HANDLE_HIT_RADIUS) return name; }
    return null;
  }
  function isInsideSelection(pos, sel) {
    const inv = getFullMatrix(sel).inverse();
    const l = inv.transformPoint(new DOMPoint(pos.x, pos.y));
    return Math.abs(l.x) <= sel.rect.w / 2 && Math.abs(l.y) <= sel.rect.h / 2;
  }
  function captureDragStart(hit, pos, sel) {
    return { hit, pos, t0: { ...sel.t }, baseInverse: getBaseMatrix(sel).inverse(), center: getCenter(sel) };
  }
  function applyDrag(mode, pos, shiftKey) {
    const sel = transformSelRef.current; const ds = dragStartRef.current;
    if (!sel || !ds) return;
    const { t0, baseInverse, center } = ds;
    if (mode === 'move') {
      sel.t.tx = t0.tx + (pos.x - ds.pos.x);
      sel.t.ty = t0.ty + (pos.y - ds.pos.y);
      return;
    }
    if (mode === 'rotate') {
      const a0 = Math.atan2(ds.pos.y - center.y, ds.pos.x - center.x);
      const a1 = Math.atan2(pos.y - center.y, pos.x - center.x);
      sel.t.rotation = t0.rotation + (a1 - a0);
      return;
    }
    const local = baseInverse.transformPoint(new DOMPoint(pos.x, pos.y));
    const hw = sel.rect.w / 2, hh = sel.rect.h / 2;
    if (CORNER_SIGN[mode]) {
      const [sx, sy] = CORNER_SIGN[mode];
      let newScaleX = local.x / (sx * hw);
      let newScaleY = local.y / (sy * hh);
      if (shiftKey) {
        const u = Math.max(Math.abs(newScaleX), Math.abs(newScaleY));
        newScaleX = Math.sign(newScaleX || 1) * u;
        newScaleY = Math.sign(newScaleY || 1) * u;
      }
      const clamp = (v) => (Math.abs(v) < MIN_SCALE ? MIN_SCALE * Math.sign(v || 1) : v);
      sel.t.scaleX = clamp(newScaleX);
      sel.t.scaleY = clamp(newScaleY);
      return;
    }
    if (mode === 'skewx-top' || mode === 'skewx-bottom') {
      const sy = mode === 'skewx-top' ? -1 : 1;
      const denom = sy * t0.scaleY * hh;
      const ang = Math.max(-MAX_SKEW_RAD, Math.min(MAX_SKEW_RAD, Math.atan(local.x / denom)));
      sel.t.skewX = ang;
      return;
    }
    if (mode === 'skewy-left' || mode === 'skewy-right') {
      const sx = mode === 'skewy-left' ? -1 : 1;
      const denom = sx * t0.scaleX * hw;
      const ang = Math.max(-MAX_SKEW_RAD, Math.min(MAX_SKEW_RAD, Math.atan(local.y / denom)));
      sel.t.skewY = ang;
      return;
    }
  }
  function renderTransformOverlay() {
    const sel = transformSelRef.current;
    const ctx = overlayRef.current.getContext('2d');
    ctx.clearRect(0, 0, DRAW_W, DRAW_H);
    if (!sel) return;
    const m = getFullMatrix(sel);
    ctx.save();
    ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    ctx.drawImage(sel.source, -sel.rect.w / 2, -sel.rect.h / 2, sel.rect.w, sel.rect.h);
    ctx.restore();

    const hp = computeHandlePoints(sel);
    ctx.save();
    ctx.strokeStyle = '#14B8A6'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(hp.tl.x, hp.tl.y); ctx.lineTo(hp.tr.x, hp.tr.y); ctx.lineTo(hp.br.x, hp.br.y); ctx.lineTo(hp.bl.x, hp.bl.y); ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(hp.topMid.x, hp.topMid.y); ctx.lineTo(hp.rotate.x, hp.rotate.y); ctx.stroke();
    ctx.restore();

    const drawHandle = (p, shape) => {
      ctx.save();
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#14B8A6'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (shape === 'circle') ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      else ctx.rect(p.x - 5, p.y - 5, 10, 10);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    };
    [hp.tl, hp.tr, hp.bl, hp.br, hp.topMid, hp.bottomMid, hp.leftMid, hp.rightMid].forEach((p) => drawHandle(p, 'square'));
    drawHandle(hp.rotate, 'circle');
  }
  function liftSelection(r) {
    const layer = activeLayer(); if (!layer) return;
    const rx = Math.max(0, Math.round(r.x)), ry = Math.max(0, Math.round(r.y));
    const rw = Math.min(DRAW_W - rx, Math.round(r.w)), rh = Math.min(DRAW_H - ry, Math.round(r.h));
    if (rw < 2 || rh < 2) return;
    drawUM.push(layer.canvas);
    const snap = document.createElement('canvas'); snap.width = rw; snap.height = rh;
    snap.getContext('2d').drawImage(layer.canvas, rx, ry, rw, rh, 0, 0, rw, rh);
    layer.ctx.clearRect(rx, ry, rw, rh);
    transformSelRef.current = {
      rect: { x: rx, y: ry, w: rw, h: rh },
      source: snap,
      layer,
      t: { tx: 0, ty: 0, rotation: 0, skewX: 0, skewY: 0, scaleX: 1, scaleY: 1 },
    };
    setHasSelection(true);
    renderTransformOverlay();
  }
  function commitTransform() {
    const sel = transformSelRef.current; if (!sel) return;
    const m = getFullMatrix(sel);
    drawUM.push(sel.layer.canvas);
    const ctx = sel.layer.ctx;
    ctx.save();
    ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(sel.source, -sel.rect.w / 2, -sel.rect.h / 2, sel.rect.w, sel.rect.h);
    ctx.restore();
    transformSelRef.current = null;
    setHasSelection(false);
    clearOverlay();
  }
  function cancelTransform() {
    if (!transformSelRef.current) return;
    drawUM.undo();
    transformSelRef.current = null;
    setHasSelection(false);
    clearOverlay();
  }
  // ============================ /TRANSFORM TOOL ==============================

  useEffect(() => {
    const overlay = overlayRef.current;
    function onDown(e) {
      const pos = getCanvasPos(e, overlay);
      isPointerDownRef.current = true; startPosRef.current = pos; lastPosRef.current = pos;
      const t = toolRef.current;

      if (t === 'pan') {
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (t === 'select') {
        const sel = transformSelRef.current;
        if (sel) {
          const hit = hitTestHandles(pos, sel);
          if (hit) { dragModeRef.current = hit; dragStartRef.current = captureDragStart(hit, pos, sel); return; }
          if (isInsideSelection(pos, sel)) { dragModeRef.current = 'move'; dragStartRef.current = { pos, t0: { ...sel.t } }; return; }
          commitTransform();
        }
        dragModeRef.current = 'marquee';
        return;
      }

      const layer = activeLayer(); if (!layer) return;
      if (['brush', 'pencil', 'airbrush', 'eraser'].includes(t)) { drawUM.push(layer.canvas); drawDab(layer.ctx, pos, pos, t); }
      else if (['rect', 'ellipse', 'line'].includes(t)) { clearOverlay(); }
    }
    function onMove(e) {
      if (!isPointerDownRef.current) return;
      const pos = getCanvasPos(e, overlay);
      const t = toolRef.current;

      if (t === 'pan') {
        const dx = e.clientX - lastPanPosRef.current.x;
        const dy = e.clientY - lastPanPosRef.current.y;
        setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (t === 'select') {
        if (dragModeRef.current === 'marquee') { clearOverlay(); drawMarqueePreview(overlay.getContext('2d'), startPosRef.current, pos); return; }
        if (dragModeRef.current) { applyDrag(dragModeRef.current, pos, e.shiftKey); renderTransformOverlay(); }
        return;
      }

      const layer = activeLayer();
      if (['brush', 'pencil', 'airbrush', 'eraser'].includes(t)) { if (layer) { drawDab(layer.ctx, lastPosRef.current, pos, t); lastPosRef.current = pos; } }
      else if (['rect', 'ellipse', 'line'].includes(t)) { clearOverlay(); drawShapePreview(overlay.getContext('2d'), startPosRef.current, pos, t); }
    }
    function onUp(e) {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      const pos = getCanvasPos(e, overlay);
      const t = toolRef.current;

      if (t === 'pan') { return; }

      if (t === 'select') {
        if (dragModeRef.current === 'marquee') {
          clearOverlay();
          const r = normRect(startPosRef.current, pos);
          if (r.w > 4 && r.h > 4) liftSelection(r);
        }
        dragModeRef.current = null;
        return;
      }

      const layer = activeLayer();
      if (['rect', 'ellipse', 'line'].includes(t) && layer) { clearOverlay(); commitShape(layer.ctx, startPosRef.current, pos, t); }
    }
    overlay.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { overlay.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayerId]);

  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (transformSelRef.current) {
        if (e.key === 'Enter') { e.preventDefault(); commitTransform(); return; }
        if (e.key === 'Escape') { e.preventDefault(); cancelTransform(); return; }
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawUM, tool]);

  useEffect(() => { 
    if (stageInnerRef.current) 
      stageInnerRef.current.style.transform = `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`; 
  }, [zoom, pan, rotation]);

  function compositeToCanvas() {
    const off = document.createElement('canvas'); off.width = DRAW_W; off.height = DRAW_H;
    const ctx = off.getContext('2d');
    
    // Iterate through layers, respecting blend modes and clipping
    layersRef.current.forEach((l, index) => {
      if (!l.visible) return;
      
      let drawLayer = true;
      ctx.save();
      ctx.globalCompositeOperation = l.blendMode || 'source-over';
      ctx.globalAlpha = l.opacity;

      // Apply Clipping logic
      if (l.clipped && index > 0) {
        const baseLayer = layersRef.current[index - 1];
        if (baseLayer && baseLayer.visible) {
          // Create a temp canvas for the clipped layer
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = DRAW_W; tempCanvas.height = DRAW_H;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(l.canvas, 0, 0);
          
          // Apply the mask of the layer below
          tempCtx.globalCompositeOperation = 'destination-in';
          tempCtx.drawImage(baseLayer.canvas, 0, 0);
          
          ctx.drawImage(tempCanvas, 0, 0);
          drawLayer = false;
        }
      }

      // Apply Masking logic
      if (drawLayer && l.maskDataUrl) {
        const maskImg = new Image();
        maskImg.src = l.maskDataUrl;
        // NOTE: This is a simplified mask. For true rendering on the fly, we should
        // pre-cache the mask image. But for the purpose of this assignment, 
        // we will draw it with a composite operation.
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = DRAW_W; tempCanvas.height = DRAW_H;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(l.canvas, 0, 0);
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskImg, 0, 0);
        
        ctx.drawImage(tempCanvas, 0, 0);
        drawLayer = false;
      }

      if (drawLayer) {
        ctx.drawImage(l.canvas, 0, 0);
      }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
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
    if (transformSelRef.current) commitTransform();
    setSaving(true); setNotice('');
    try {
      const thumbCanvas = document.createElement('canvas'); thumbCanvas.width = 240; thumbCanvas.height = 160;
      thumbCanvas.getContext('2d').drawImage(compositeToCanvas(), 0, 0, 240, 160);
      const payload = {
        title: 'Illustration', type: 'illustration', width: DRAW_W, height: DRAW_H,
        thumbnail: thumbCanvas.toDataURL(),
        layers: layersRef.current.map((l) => ({ 
          name: l.name, dataUrl: l.canvas.toDataURL(), visible: l.visible, opacity: l.opacity,
          blendMode: l.blendMode, clipped: l.clipped, maskDataUrl: l.maskDataUrl
        })),
      };
      await client.post('/projects', payload);
      setNotice('Saved.');
    } catch (err) { setNotice(err.response?.data?.message || 'Could not save.'); }
    finally { setSaving(false); }
  }

  useEffect(() => { addLayer('Layer 1'); /* eslint-disable-next-line */ }, []);

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

        <div className="flex items-center gap-2 border-l border-neutral-200 dark:border-neutral-800 pl-3 ml-1">
          <span className="text-xs font-mono uppercase text-neutral-400">Rotate</span>
          <button className="btn !py-1 text-xs" onClick={() => setRotation(0)}>0°</button>
          <button className="btn !py-1 text-xs" onClick={() => setRotation(90)}>90°</button>
          <button className="btn !py-1 text-xs" onClick={() => setRotation(180)}>180°</button>
          <button className="btn !py-1 text-xs" onClick={() => setRotation(270)}>270°</button>
          <span className="font-mono text-xs text-neutral-500 w-12 text-center">{rotation}°</span>
        </div>

        {hasSelection && (
          <>
            <span className="text-[11px] text-neutral-400 hidden lg:inline">
              Drag corners to scale (Shift = uniform) • edges to skew • top handle to rotate • Enter to commit • Esc to cancel
            </span>
            <button className="btn !py-1 text-xs" onClick={cancelTransform}>Cancel</button>
            <button className="btn btn-primary !py-1 text-xs" onClick={commitTransform}>Commit transform</button>
          </>
        )}

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
          <button title="select / transform (scale, rotate, skew)" onClick={() => setTool('select')}
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
                
                {/* Layer Top Row */}
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

                {/* Faria's Module 2: Blend Mode, Clipping, Mask */}
                <div className="flex items-center gap-2 mb-2">
                  <select 
                    className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-[10px] rounded border border-neutral-200 dark:border-neutral-700 px-1 py-0.5"
                    value={l.blendMode}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateLayerBlendMode(l.id, e.target.value)}
                  >
                    {BLEND_MODES.map((mode) => (
                      <option key={mode.id} value={mode.id}>{mode.label}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLayerClipping(l.id); }}
                    title="Toggle Clipping"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.clipped ? 'bg-teal-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'}`}
                  >
                    Clip
                  </button>
                  
                  {l.maskDataUrl ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeLayerMask(l.id); }}
                      title="Remove Mask"
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white"
                    >
                      Unmask
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); addLayerMask(l.id); }}
                      title="Add Mask"
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-500 hover:bg-teal-500 hover:text-white"
                    >
                      Mask
                    </button>
                  )}
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
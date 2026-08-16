import { useEffect, useRef, useState } from 'react';
import client from '../api/client.js';
import { UploadIcon } from '../components/icons/Icons.jsx';

const MAX_W = 900, MAX_H = 600;

export default function PhotoStudio() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const cropRectRef = useRef(null);
  const originalImgRef = useRef(null);
  const baseImageRef = useRef(null);
  const origSizeRef = useRef({ w: 0, h: 0 });

  const [hasImage, setHasImage] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  function filterString() { return `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`; }
  function renderPhoto() {
    const canvas = canvasRef.current;
    if (!canvas || !baseImageRef.current) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = filterString();
    ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
  }
  useEffect(renderPhoto, [brightness, contrast, saturation]);

  function setupPhoto(img) {
    const scale = Math.min(1, MAX_W / img.width, MAX_H / img.height);
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    origSizeRef.current = { w, h };
    canvasRef.current.width = w; canvasRef.current.height = h;
    originalImgRef.current = img; baseImageRef.current = img;
    setBrightness(0); setContrast(0); setSaturation(0);
    setHasImage(true);
    requestAnimationFrame(renderPhoto);
  }
  function handleFiles(fileList) {
    const file = fileList && fileList[0];
    if (!file || !file.type.startsWith('image/')) return;
    const img = new Image();
    img.onload = () => setupPhoto(img);
    img.src = URL.createObjectURL(file);
  }
  function resetAll() {
    if (!originalImgRef.current) return;
    baseImageRef.current = originalImgRef.current;
    canvasRef.current.width = origSizeRef.current.w; canvasRef.current.height = origSizeRef.current.h;
    setBrightness(0); setContrast(0); setSaturation(0);
    requestAnimationFrame(renderPhoto);
  }
  function downloadPNG() {
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'illust-studio-photo.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }

  function clampRect(r, canvas) {
    r.w = Math.max(20, Math.min(r.w, canvas.width));
    r.h = Math.max(20, Math.min(r.h, canvas.height));
    r.x = Math.max(0, Math.min(r.x, canvas.width - r.w));
    r.y = Math.max(0, Math.min(r.y, canvas.height - r.h));
    return r;
  }
  function enterCrop() {
    if (!hasImage || cropMode) return;
    setCropMode(true);
    const canvas = canvasRef.current;
    const r = clampRect({ x: canvas.width * 0.1, y: canvas.height * 0.1, w: canvas.width * 0.8, h: canvas.height * 0.8 }, canvas);
    const el = document.createElement('div');
    el.style.position = 'absolute'; el.style.border = '2px dashed #14B8A6'; el.style.background = 'rgba(20,184,166,.08)'; el.style.cursor = 'move';
    el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px';
    const handle = document.createElement('div');
    handle.style.position = 'absolute'; handle.style.right = '-7px'; handle.style.bottom = '-7px';
    handle.style.width = '14px'; handle.style.height = '14px'; handle.style.background = '#14B8A6'; handle.style.borderRadius = '3px'; handle.style.cursor = 'nwse-resize';
    el.appendChild(handle);
    wrapRef.current.appendChild(el);
    cropRectRef.current = el;

    function dragUntilUp(moveFn) {
      function move(e) { moveFn(e); }
      function up() { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); }
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    }
    el.addEventListener('pointerdown', (e) => {
      if (e.target === handle) return;
      const startX = e.clientX, startY = e.clientY;
      const origLeft = parseFloat(el.style.left), origTop = parseFloat(el.style.top);
      dragUntilUp((ev) => {
        const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
        let nx = origLeft + (ev.clientX - startX), ny = origTop + (ev.clientY - startY);
        nx = Math.max(0, Math.min(nx, canvas.width - w)); ny = Math.max(0, Math.min(ny, canvas.height - h));
        el.style.left = nx + 'px'; el.style.top = ny + 'px';
      });
    });
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const startX = e.clientX, startY = e.clientY;
      const origW = parseFloat(el.style.width), origH = parseFloat(el.style.height);
      const left = parseFloat(el.style.left), top = parseFloat(el.style.top);
      dragUntilUp((ev) => {
        let nw = origW + (ev.clientX - startX), nh = origH + (ev.clientY - startY);
        nw = Math.max(20, Math.min(nw, canvas.width - left)); nh = Math.max(20, Math.min(nh, canvas.height - top));
        el.style.width = nw + 'px'; el.style.height = nh + 'px';
      });
    });
  }
  function exitCrop() {
    setCropMode(false);
    if (cropRectRef.current) { cropRectRef.current.remove(); cropRectRef.current = null; }
  }
  function applyCrop() {
    const el = cropRectRef.current; if (!el) return;
    const canvas = canvasRef.current;
    const r = clampRect({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: parseFloat(el.style.width), h: parseFloat(el.style.height) }, canvas);
    const x = Math.round(r.x), y = Math.round(r.y), w = Math.round(r.w), h = Math.round(r.h);
    const imgData = canvas.getContext('2d').getImageData(x, y, w, h);
    const cropped = document.createElement('canvas'); cropped.width = w; cropped.height = h;
    cropped.getContext('2d').putImageData(imgData, 0, 0);
    baseImageRef.current = cropped;
    canvas.width = w; canvas.height = h;
    setBrightness(0); setContrast(0); setSaturation(0);
    exitCrop();
    requestAnimationFrame(renderPhoto);
  }

  async function save() {
    setSaving(true); setNotice('');
    try {
      const payload = { title: 'Photo edit', type: 'photo', width: canvasRef.current.width, height: canvasRef.current.height, photoDataUrl: canvasRef.current.toDataURL(), thumbnail: canvasRef.current.toDataURL() };
      await client.post('/projects', payload);
      setNotice('Saved.');
    } catch (err) { setNotice(err.response?.data?.message || 'Could not save.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex-wrap">
        <div className="flex-1" />
        {notice && <span className="text-xs text-neutral-500">{notice}</span>}
        {hasImage && <button disabled={saving} className="btn btn-primary !py-1 text-xs" onClick={save}>{saving ? 'Saving…' : 'Save'}</button>}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          {!hasImage ? (
            <label className="w-[420px] max-w-[80vw] h-64 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl flex flex-col items-center justify-center gap-3 text-neutral-500 cursor-pointer"
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
              <UploadIcon className="w-9 h-9 text-teal-600" />
              <b className="text-neutral-700 dark:text-neutral-200">Drop a photo here</b>
              <span>or click to browse your device</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          ) : (
            <div ref={wrapRef} className="relative inline-block shadow-xl checker">
              <canvas ref={canvasRef} />
            </div>
          )}
        </div>

        {hasImage && (
          <div className="w-64 border-l border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-5 overflow-y-auto flex-none">
            <label className="btn text-xs cursor-pointer text-center">
              Change photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            {[['Brightness', brightness, setBrightness], ['Contrast', contrast, setContrast], ['Saturation', saturation, setSaturation]].map(([label, val, setter]) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1"><span className="font-mono uppercase text-neutral-400">{label}</span><span>{val}</span></div>
                <input type="range" min={-100} max={100} value={val} onChange={(e) => setter(+e.target.value)} className="w-full" />
              </div>
            ))}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
              {!cropMode ? (
                <button className="btn w-full text-xs" onClick={enterCrop}>Crop image</button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn btn-primary flex-1 text-xs" onClick={applyCrop}>Apply crop</button>
                  <button className="btn flex-1 text-xs" onClick={exitCrop}>Cancel</button>
                </div>
              )}
            </div>
            <button className="btn text-xs" onClick={resetAll}>Reset all edits</button>
            <button className="btn btn-primary text-xs" onClick={downloadPNG}>Download PNG</button>
          </div>
        )}
      </div>
    </div>
  );
}
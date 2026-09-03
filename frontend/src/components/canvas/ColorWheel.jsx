import { useEffect, useRef } from 'react';
import { hsvToRgb, rgbToHex, hexToRgb, rgbToHsv } from './colorUtils.js';

export default function ColorWheel({ color, onChange, size = 64 }) {
  const canvasRef = useRef(null);
  const hsvRef = useRef({ h: 0, s: 1, v: 1 });

  function draw() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2, r = size / 2 - 1;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();

    if (ctx.createConicGradient) {
      const conic = ctx.createConicGradient(-Math.PI / 2, cx, cy);
      for (let i = 0; i <= 6; i++) conic.addColorStop(i / 6, `hsl(${i * 60},100%,50%)`);
      ctx.fillStyle = conic;
    } else {
      for (let a = 0; a < 360; a += 2) {
        ctx.fillStyle = `hsl(${a},100%,50%)`;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, (a * Math.PI) / 180, ((a + 2.5) * Math.PI) / 180);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.fillRect(0, 0, size, size);

    const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    radial.addColorStop(0, 'rgba(0,0,0,1)');
    radial.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  useEffect(() => {
    const rgb = hexToRgb(color);
    hsvRef.current = rgbToHsv(rgb.r, rgb.g, rgb.b);
    draw();
  }, []);

  function emit() {
    const { h, v } = hsvRef.current;
    const { r, g, b } = hsvToRgb(h, 1, v);
    onChange(rgbToHex(r, g, b));
  }
  function dragUntilUp(moveFn) {
    function move(e) { moveFn(e); }
    function up() { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  function onDown(e) {
    function move(ev) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (ev.clientX - rect.left) * (size / rect.width) - size / 2;
      const y = (ev.clientY - rect.top) * (size / rect.height) - size / 2;
      let ang = (Math.atan2(y, x) * 180) / Math.PI + 90; if (ang < 0) ang += 360;
      const dist = Math.min(1, Math.sqrt(x * x + y * y) / (size / 2 - 1));
      hsvRef.current = { h: ang, s: 1, v: dist };
      emit();
    }
    move(e); dragUntilUp(move);
  }

  return (
    <canvas ref={canvasRef} width={size} height={size} onPointerDown={onDown}
      style={{ borderRadius: '50%', cursor: 'crosshair', touchAction: 'none' }} />
  );
}
import { useRef, useState, useEffect } from 'react';
import api from '../../services/api';

const CanvasEditor = ({ fileId, canvasRef, filter }) => {
  const internalCanvasRef = canvasRef || useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [layers, setLayers] = useState([{ id: 1, name: 'Layer 1', visible: true }]);
  const [activeLayer, setActiveLayer] = useState(1);

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    ctxRef.current = context;

    if (fileId) {
      api.get(`/files/${fileId}`)
        .then(res => {
          const { canvasData } = res.data;
          if (canvasData) {
            const img = new Image();
            img.onload = () => {
              context.drawImage(img, 0, 0);
              setHistory([canvas.toDataURL()]);
              setHistoryIndex(0);
            };
            img.src = canvasData;
          } else {
            const blank = canvas.toDataURL();
            setHistory([blank]);
            setHistoryIndex(0);
          }
        })
        .catch(err => console.error('Failed to load artwork:', err));
    } else {
      const blank = canvas.toDataURL();
      setHistory([blank]);
      setHistoryIndex(0);
    }
  }, [fileId]);

  const saveToHistory = () => {
    const canvas = internalCanvasRef.current;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const img = new Image();
      img.onload = () => {
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, internalCanvasRef.current.width, internalCanvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[newIndex];
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const img = new Image();
      img.onload = () => {
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, internalCanvasRef.current.width, internalCanvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[newIndex];
      setHistoryIndex(newIndex);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = ctxRef.current;
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else if (tool === 'airbrush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(offsetX, offsetY, brushSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = ctxRef.current;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      saveToHistory();
    }
  };

  const getCoordinates = (e) => {
    const rect = internalCanvasRef.current.getBoundingClientRect();
    const scaleX = internalCanvasRef.current.width / rect.width;
    const scaleY = internalCanvasRef.current.height / rect.height;
    return {
      offsetX: (e.clientX - rect.left) * scaleX,
      offsetY: (e.clientY - rect.top) * scaleY,
    };
  };

  const saveArtwork = async () => {
    const canvas = internalCanvasRef.current;
    const dataUrl = canvas.toDataURL();
    try {
      if (fileId) {
        await api.put(`/files/${fileId}`, { canvasData: dataUrl });
        alert('Artwork saved!');
      } else {
        const res = await api.post('/files', {
          title: 'New Artwork',
          fileType: 'illustration',
          canvasData: dataUrl,
        });
        alert(`Artwork created with ID: ${res.data._id}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save artwork');
    }
  };

  const exportAsPNG = () => {
    const canvas = internalCanvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'artwork.png';
    link.href = dataUrl;
    link.click();
  };

  const exportAsJPEG = () => {
    const canvas = internalCanvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = 'artwork.jpg';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 p-3 flex flex-wrap items-center gap-2">
        {/* Tool buttons */}
        <button className={`px-3 py-1 rounded ${tool === 'brush' ? 'bg-blue-500 text-white' : 'bg-white'}`} onClick={() => setTool('brush')}>Brush</button>
        <button className={`px-3 py-1 rounded ${tool === 'pencil' ? 'bg-blue-500 text-white' : 'bg-white'}`} onClick={() => setTool('pencil')}>Pencil</button>
        <button className={`px-3 py-1 rounded ${tool === 'airbrush' ? 'bg-blue-500 text-white' : 'bg-white'}`} onClick={() => setTool('airbrush')}>Airbrush</button>
        <button className={`px-3 py-1 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white'}`} onClick={() => setTool('eraser')}>Eraser</button>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 cursor-pointer" />
        <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-32" />
        <span className="text-sm">Size: {brushSize}</span>
        <div className="flex-grow" />
        <button onClick={undo} className="px-3 py-1 bg-white rounded hover:bg-gray-200">Undo</button>
        <button onClick={redo} className="px-3 py-1 bg-white rounded hover:bg-gray-200">Redo</button>
        <button onClick={saveArtwork} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
        <button onClick={exportAsPNG} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Export PNG</button>
        <button onClick={exportAsJPEG} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Export JPG</button>
      </div>

      {/* Layers + Canvas */}
      <div className="flex flex-1">
        <div className="w-48 bg-gray-200 p-3">
          <h3 className="font-bold mb-2">Layers</h3>
          {layers.map((layer) => (
            <div key={layer.id} className={`p-2 mb-1 rounded cursor-pointer ${activeLayer === layer.id ? 'bg-blue-300' : 'bg-white'}`} onClick={() => setActiveLayer(layer.id)}>{layer.name}</div>
          ))}
          <button className="mt-2 text-sm text-blue-600" onClick={() => setLayers([...layers, { id: layers.length + 1, name: `Layer ${layers.length + 1}`, visible: true }])}>+ Add Layer</button>
        </div>
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-4">
          <canvas ref={internalCanvasRef} style={{ filter }} className="border border-gray-300 bg-white shadow-lg" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing} onMouseLeave={endDrawing} />
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
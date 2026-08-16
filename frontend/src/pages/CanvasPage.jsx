import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CanvasEditor from '../components/canvas/CanvasEditor';
import AnimationTimeline from '../components/canvas/AnimationTimeline';
import PhotoFilters from '../components/canvas/PhotoFilters';

const CanvasPage = () => {
  const { fileId } = useParams();
  const canvasRef = useRef(null); // shared canvas ref (passed to CanvasEditor)
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'animate' | 'photo'
  const [frames, setFrames] = useState([]);
  const [filter, setFilter] = useState('none');

  return (
    <div className="flex flex-col h-screen">
      {/* Tab Bar */}
      <div className="bg-gray-200 p-2 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'draw' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          onClick={() => setActiveTab('draw')}
        >
          Draw
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'animate' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          onClick={() => setActiveTab('animate')}
        >
          Animate
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'photo' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          onClick={() => setActiveTab('photo')}
        >
          Photo Edit
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'draw' && (
        <CanvasEditor fileId={fileId} canvasRef={canvasRef} filter={filter} />
      )}
      {activeTab === 'animate' && (
        <div className="p-4">
          <AnimationTimeline frames={frames} setFrames={setFrames} canvasRef={canvasRef} />
        </div>
      )}
      {activeTab === 'photo' && (
        <div className="p-4">
          <PhotoFilters filter={filter} setFilter={setFilter} />
          <p className="mt-2 text-sm text-gray-600">
            Filters apply to the canvas in the Draw tab. Switch back to Draw to see the effect.
          </p>
        </div>
      )}
    </div>
  );
};

export default CanvasPage;
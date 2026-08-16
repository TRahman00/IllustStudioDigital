import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArtistDashboardPage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Artist Dashboard</h1>
      <button onClick={() => navigate('/canvas/new')} className="bg-blue-500 text-white px-4 py-2 rounded">Create New Artwork</button>
    </div>
  );
};

export default ArtistDashboardPage;
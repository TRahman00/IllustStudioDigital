import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CanvasPage from './pages/CanvasPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/canvas/new" />} />
        <Route path="/canvas/:fileId" element={<CanvasPage />} />
        <Route path="*" element={<Navigate to="/canvas/new" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
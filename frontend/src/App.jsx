import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReadPage from './ReadPage';
import AdminPage from './AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReadPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

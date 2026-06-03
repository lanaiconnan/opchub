import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Publish from './pages/Publish';
import MyCollaborations from './pages/MyCollaborations';
import ChatPage from './pages/ChatPage';
import MyApplications from './pages/MyApplications';
import Login from './pages/Login';
import Register from './pages/Register';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publish" element={<RequireAuth><Publish /></RequireAuth>} />
        <Route path="/my-collaborations" element={<RequireAuth><MyCollaborations /></RequireAuth>} />
        <Route path="/my-applications" element={<RequireAuth><MyApplications /></RequireAuth>} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
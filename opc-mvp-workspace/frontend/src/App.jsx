import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Publish from './pages/Publish';
import MyCollaborations from './pages/MyCollaborations';
import ChatPage from './pages/ChatPage';
import MyApplications from './pages/MyApplications';
import Login from './pages/Login';
import Register from './pages/Register';
import NotificationPage from './pages/NotificationPage';
import Stats from './pages/Stats';
import DetailPage from './pages/DetailPage';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/publish" element={<RequireAuth><Publish /></RequireAuth>} />
            <Route path="/my-collaborations" element={<RequireAuth><MyCollaborations /></RequireAuth>} />
            <Route path="/my-applications" element={<RequireAuth><MyApplications /></RequireAuth>} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/notifications" element={<RequireAuth><NotificationPage /></RequireAuth>} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/opc/:id" element={<DetailPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

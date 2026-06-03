import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Publish from './pages/Publish';
import MyCollaborations from './pages/MyCollaborations';
import ChatPage from './pages/ChatPage';
import MyApplications from './pages/MyApplications';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/my-collaborations" element={<MyCollaborations />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateDeck from './pages/CreateDeck';
import StudyDeck from './pages/StudyDeck';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateDeck />} />
        <Route path="/deck/:id" element={<StudyDeck />} />
      </Routes>
    </Router>
  );
}

export default App;

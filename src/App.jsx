import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import AssessmentData from './pages/Dashboard/AssessmentData';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<AssessmentData />} />
           <Route path="/" element={<AssessmentData />} />
            <Route path="/" element={<AssessmentData />} />
         
        </Routes>
      </div>
    </Router>
  );
}

export default App;
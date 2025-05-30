import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Institutions from './pages/Institutions';
import  Chart from  './components/Chart/Chartview';




import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/institutions" element={<Institutions />} /> 
          <Route path= "/" element={<Chart/>}/>
        </Routes>
      
      </div>
    </Router>
  );
}

export default App;
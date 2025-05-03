import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.svg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsOpen(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isMobile && (
        <button className="mobile-menu-button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <nav className="nav-menu">
          <Link to="/" className="nav-link" onClick={() => isMobile && setIsOpen(false)}>
            Assessment Data
          </Link>
          
        </nav>
      </div>
    </>
  );
};

export default Navbar;
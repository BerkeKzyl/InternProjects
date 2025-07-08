import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="nav-container">
          <div className="logo">
            <h2>DestekSite</h2>
          </div>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <a href="#ana-sayfa" onClick={() => setIsMenuOpen(false)}>Ana Sayfa</a>
            <a href="#hizmetler" onClick={() => setIsMenuOpen(false)}>Hizmetler</a>
            <a href="#iletisim" onClick={() => setIsMenuOpen(false)}>İletişim</a>
            <a href="#destek" className="btn" onClick={() => setIsMenuOpen(false)}>Canlı Destek</a>
          </nav>

          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DestekSite</h3>
            <p>
              7/24 profesyonel destek hizmeti ile yanınızdayız. 
              Sorularınızı yanıtlıyor, problemlerinizi çözüyoruz.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Hızlı Linkler</h4>
            <ul>
              <li><a href="#ana-sayfa">Ana Sayfa</a></li>
              <li><a href="#hizmetler">Hizmetler</a></li>
              <li><a href="#iletisim">İletişim</a></li>
              <li><a href="#destek">Canlı Destek</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Destek</h4>
            <ul>
              <li><a href="#">SSS</a></li>
              <li><a href="#">Yardım Merkezi</a></li>
              <li><a href="#">Kullanım Kılavuzu</a></li>
              <li><a href="#">Video Eğitimler</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>İletişim</h4>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>+90 (212) 123 45 67</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>destek@desteksite.com</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-clock"></i>
              <span>7/24 Hizmet</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 DestekSite. Tüm hakları saklıdır.</p>
          <div className="footer-links">
            <a href="#">Gizlilik Politikası</a>
            <a href="#">Kullanım Şartları</a>
            <a href="#">Çerez Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
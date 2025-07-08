import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="ana-sayfa" className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Size Yardımcı Olmak İçin Buradayız</h1>
          <p>
            Profesyonel destek ekibimizle 7/24 yanınızdayız. 
            Sorularınızı yanıtlıyor, problemlerinizi çözüyoruz.
          </p>
          <div className="hero-buttons">
            <a href="#iletisim" className="btn">Hemen Başla</a>
            <a href="#hizmetler" className="btn btn-outline">Hizmetleri Gör</a>
          </div>
        </div>
        <div className="hero-image">
          <div className="support-illustration">
            <i className="fas fa-headset"></i>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
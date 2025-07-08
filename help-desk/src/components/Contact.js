import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada form gönderme işlemi yapılacak
    console.log('Form gönderildi:', formData);
    alert('Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section id="iletisim" className="contact">
      <div className="container">
        <div className="section-header">
          <h2>Bizimle İletişime Geçin</h2>
          <p>Sorularınızı, önerilerinizi veya destek talebinizi bize iletin</p>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div>
                <h4>Telefon</h4>
                <p>+90 (212) 123 45 67</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <h4>E-posta</h4>
                <p>destek@desteksite.com</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div>
                <h4>Çalışma Saatleri</h4>
                <p>7/24 Hizmet</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <h4>Adres</h4>
                <p>İstanbul, Türkiye</p>
              </div>
            </div>
          </div>
          
          <form className="contact-form card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Adınız *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-posta *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Konu</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Mesajınız *</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="btn">
              <i className="fas fa-paper-plane"></i>
              Mesaj Gönder
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact; 
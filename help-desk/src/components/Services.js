import React from 'react';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: 'fas fa-comments',
      title: 'Canlı Sohbet',
      description: 'Anlık mesajlaşma ile hızlı destek alın. Uzman ekibimiz sorularınızı anında yanıtlar.'
    },
    {
      icon: 'fas fa-phone',
      title: 'Telefon Desteği',
      description: '7/24 telefon hattımızdan bize ulaşabilir, sesli görüşme ile destek alabilirsiniz.'
    },
    {
      icon: 'fas fa-envelope',
      title: 'E-posta Desteği',
      description: 'Detaylı sorularınızı e-posta ile gönderin, uzman yanıtları 24 saat içinde alın.'
    },
    {
      icon: 'fas fa-video',
      title: 'Video Görüşme',
      description: 'Karmaşık sorunlar için görüntülü görüşme desteği. Ekran paylaşımı ile çözüm.'
    },
    {
      icon: 'fas fa-book',
      title: 'Bilgi Bankası',
      description: 'Sık sorulan sorular ve detaylı kılavuzlar ile kendi kendinize çözüm bulun.'
    },
    {
      icon: 'fas fa-tools',
      title: 'Teknik Destek',
      description: 'Teknik problemleriniz için uzman ekibimiz donanım ve yazılım desteği sağlar.'
    }
  ];

  return (
    <section id="hizmetler" className="services">
      <div className="container">
        <div className="section-header">
          <h2>Nasıl Yardımcı Olabiliriz?</h2>
          <p>Size en uygun destek kanalını seçin ve hemen yardım almaya başlayın</p>
        </div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card card">
              <div className="service-icon">
                <i className={service.icon}></i>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 
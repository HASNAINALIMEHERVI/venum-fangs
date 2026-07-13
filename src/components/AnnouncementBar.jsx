import React from 'react';

const AnnouncementBar = () => {
  return (
    <div className="ticker-wrap">
      <div className="ticker-content">
        <span className="ticker-item">Drop I: <span>Corrosive Fangs</span> is now live</span>
        <span className="ticker-item">100% Heavyweight Combed Cotton (240 GSM)</span>
        <span className="ticker-item">Flat Shipping Rate: 299 PKR</span>
        <span className="ticker-item"><span>Limited Drop</span> — No Restocks</span>
        
        {/* Repeat for seamless scroll */}
        <span className="ticker-item">Drop I: <span>Corrosive Fangs</span> is now live</span>
        <span className="ticker-item">100% Heavyweight Combed Cotton (240 GSM)</span>
        <span className="ticker-item">Flat Shipping Rate: 299 PKR</span>
        <span className="ticker-item"><span>Limited Drop</span> — No Restocks</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;

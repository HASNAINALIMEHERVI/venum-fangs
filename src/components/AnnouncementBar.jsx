import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AnnouncementBar = () => {
  const defaultText = "Drop I is now live — Shop the collection. 100% Heavyweight Combed Cotton (240 GSM). Flat Shipping Rate: 299 PKR. Limited Drop — No Restocks";
  const [announcementText, setAnnouncementText] = useState(defaultText);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const docRef = doc(db, 'settings', 'announcement_bar');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().text) {
          setAnnouncementText(docSnap.data().text);
        }
      } catch (error) {
        console.error("Error fetching announcement text:", error);
      }
    };

    fetchAnnouncement();
  }, []);

  const items = announcementText.split(/\. | — /).filter(Boolean);

  return (
    <div className="ticker-wrap">
      <div className="ticker-content">
        {items.map((item, index) => (
          <span key={index} className="ticker-item">{item}</span>
        ))}
        {/* Repeat for seamless scroll */}
        {items.map((item, index) => (
          <span key={`repeat-${index}`} className="ticker-item">{item}</span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;

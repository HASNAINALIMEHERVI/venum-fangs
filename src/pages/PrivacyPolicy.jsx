import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2.5rem 1.25rem 4rem',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-secondary)'
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2.5rem' }}>
        <Link to="/" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</Link>
        <ChevronRight size={12} color="var(--text-muted)" />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Privacy Policy</span>
      </div>

      <h1 style={{
        fontFamily: '"Didot", "Bodoni MT", "Georgia", serif',
        fontSize: '2rem',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '2rem',
        color: 'var(--text-primary)',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '1rem'
      }}>
        Privacy Policy
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.7', fontSize: '0.9rem' }}>
        <p>
          At <strong>Black Loom</strong>, accessible from wearblackloom.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Black Loom and how we use it.
        </p>
        <p>
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
        </p>

        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Information We Collect</h2>
        <p>
          The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
        </p>
        <p>
          If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
        </p>
        <p>
          When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.
        </p>

        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>How We Use Your Information</h2>
        <p>We use the information we collect in various ways, including to:</p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
          <li>Send you emails and process your orders</li>
          <li>Find and prevent fraud</li>
        </ul>

        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Log Files</h2>
        <p>
          Black Loom follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
        </p>

        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cookies and Web Beacons</h2>
        <p>
          Like any other website, Black Loom uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
        </p>

        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Us</h2>
        <p>
          If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
        </p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyleType: 'none', padding: 0 }}>
          <li><strong>Email:</strong> support@wearblackloom.com</li>
          <li><strong>WhatsApp:</strong> 03709539945</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

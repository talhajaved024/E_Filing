import React, { useState, useEffect } from 'react';
import {
  CCard,
 
} from '@coreui/react';
const TrialExpired = () => {
  const [isGrey, setIsGrey] = useState(false);

  useEffect(() => {
    // Remove default body margins and overflow
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    // Trigger the transition shortly after the component mounts
    const timer = setTimeout(() => {
      setIsGrey(true);
    }, 500); // 0.5s delay before starting the fade

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // Initial color is Red, transitions to Grey
    backgroundColor: isGrey ? '#808080' : '#d32f2f', 
    transition: 'background-color 3s ease-in-out',
    margin: 0,
    overflow: 'hidden',
    fontFamily: 'sans-serif'
  };

  const textStyle = {
    color: 'white',
    fontSize: 'clamp(1.5rem, 5vw, 3rem)',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadow: '0px 4px 10px rgba(0,0,0,0.3)',
    padding: '0 1rem', // Prevent text from touching edges on mobile
  };

  return (
    <CCard>
    <div style={containerStyle}>
      <h2 style={textStyle}>The trial period for your account has expired.</h2>
    </div>
    </CCard>
  );
};

export default TrialExpired;
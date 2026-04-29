import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        // Direct DOM manipulation performance ke liye behtar hai
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div 
      ref={cursorRef}
      className="custom-cursor fixed top-0 left-0 w-8 h-8 border border-cyan-500 rounded-full mix-blend-difference pointer-events-none transition-transform duration-75 ease-out"
      style={{ marginLeft: '-16px', marginTop: '-16px' }}
    />
  );
};

export default CustomCursor;
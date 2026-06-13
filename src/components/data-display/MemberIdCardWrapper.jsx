import { useState, useRef, useEffect } from 'react';

export default function MemberIdCardWrapper({ children }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState('auto');

  // Measure the container width to determine if we need to scale down
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === containerRef.current) {
          // Subtract a small amount of padding (e.g., 32px)
          const availableWidth = entry.contentRect.width - 32;
          
          if (availableWidth > 0 && availableWidth < 500) {
            const newScale = availableWidth / 500;
            setScale(newScale);
          } else {
            setScale(1);
          }
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Update height when scale changes so the container doesn't leave extra whitespace
  useEffect(() => {
    if (contentRef.current && scale < 1) {
      // setTimeout ensures the DOM has rendered the child at least once
      setTimeout(() => {
        if (contentRef.current) {
          // Calculate original unscaled height
          const unscaledHeight = contentRef.current.offsetHeight;
          if (unscaledHeight > 0) {
            setHeight(`${unscaledHeight * scale}px`);
          }
        }
      }, 0);
    } else {
      setHeight('auto');
    }
  }, [scale, children]);

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center" 
      style={{ height, transition: 'height 0.2s ease-out' }}
    >
      <div 
        ref={contentRef}
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}

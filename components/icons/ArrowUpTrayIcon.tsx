
import React from 'react';

interface ArrowUpTrayIconProps extends React.SVGProps<SVGSVGElement> {}

export const ArrowUpTrayIcon: React.FC<ArrowUpTrayIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m0 0V12M12 16.5l-4.5-4.5m4.5 4.5l4.5-4.5M12 3v13.5" />
  </svg>
);

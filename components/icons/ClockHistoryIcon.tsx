import React from 'react';

interface ClockHistoryIconProps extends React.SVGProps<SVGSVGElement> {}

export const ClockHistoryIcon: React.FC<ClockHistoryIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H21m-1.5-1.5V9M12 3v1.5m-3.364 1.558L7.5 4.5M4.5 12H3m1.5 1.5V15m3.364-1.558L7.5 19.5" />
  </svg>
);
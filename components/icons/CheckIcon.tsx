import React from 'react';

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

export const CheckIcon: React.FC<CheckIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2.5}  // Slightly thicker stroke
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
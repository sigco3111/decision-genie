
import React from 'react';

interface SparklesIconProps extends React.SVGProps<SVGSVGElement> {}

export const SparklesIcon: React.FC<SparklesIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188a2.25 2.25 0 00-1.723-1.723L12 9l2.188-1.25a2.25 2.25 0 001.723-1.723L17 3.812l1.25 2.188a2.25 2.25 0 001.723 1.723L22.188 9l-2.188 1.25a2.25 2.25 0 00-1.723 1.723z" />
  </svg>
);
    
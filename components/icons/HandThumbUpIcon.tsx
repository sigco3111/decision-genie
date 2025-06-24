import React from 'react';

interface HandThumbUpIconProps extends React.SVGProps<SVGSVGElement> {}

export const HandThumbUpIcon: React.FC<HandThumbUpIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00-.422-4.57L12.06.319a4.5 4.5 0 00-6.364 0l-1.09 1.09a4.5 4.5 0 00-1.414 3.182V10.5M6.633 10.5H21m-14.367 0a4.5 4.5 0 00-1.414 3.182V17.25a4.5 4.5 0 00.422 1.932l1.105 1.104a4.5 4.5 0 006.364 0l1.09-1.09a4.5 4.5 0 001.414-3.182V10.5m-6.364 0a4.5 4.5 0 00-4.5-4.5H6.633a4.5 4.5 0 00-4.5 4.5m14.367 0H10.5m10.5 0l-2.098.665c-.298.099-.615.148-.932.148h-3.468V10.5" />
  </svg>
);
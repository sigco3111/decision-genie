import React from 'react';

interface TrashIconProps extends React.SVGProps<SVGSVGElement> {}

export const TrashIcon: React.FC<TrashIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.096m-3.22-.096A48.37 48.37 0 016.75 5.25m6.75-3H9.75M12 3V2.25M15 5.25v-.75a3.375 3.375 0 00-3.375-3.375H10.125a3.375 3.375 0 00-3.375 3.375v.75m5.25 0H9.75" />
  </svg>
);
import React from 'react';

interface LightbulbIconProps extends React.SVGProps<SVGSVGElement> {}

export const LightbulbIcon: React.FC<LightbulbIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a3.375 3.375 0 01-3 0m3 0a3.375 3.375 0 00-3 0m.375 0a3.375 3.375 0 01-3.75 0m0 0H6.375M12 3v2.25A6.01 6.01 0 0112 3zM12 3a6.01 6.01 0 00-1.897.303m1.897-.303A6.01 6.01 0 0113.897 3M12 21a9.753 9.753 0 01-4.873-1.348m4.873 1.348A9.753 9.753 0 0016.873 19.652M9.878 6.878A6.01 6.01 0 0112 6.75m-2.122.128a6.012 6.012 0 00-1.41 1.41m1.41-1.41A6.01 6.01 0 0112 6.75m2.122.128a6.011 6.011 0 001.41 1.41m-1.41-1.41A6.01 6.01 0 0012 6.75M12 9a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
  </svg>
);
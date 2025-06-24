
import React from 'react';

interface ChatBubbleLeftRightIconProps extends React.SVGProps<SVGSVGElement> {}

export const ChatBubbleLeftRightIcon: React.FC<ChatBubbleLeftRightIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.684-3.091a1.993 1.993 0 00-1.096-.307H6.75A2.25 2.25 0 014.5 15V6.75A2.25 2.25 0 016.75 4.5h7.5c.884 0 1.672.484 2.063 1.222M10.5 11.25H12M10.5 12.75H12m-3.75-.375h.375m-3.75 0h.375m3 .375h.375m-3.75 0h.375M5.25 6H9m-3.75 0H6.375M5.25 6H9m-3.75 0H6.375M5.25 6H9m-3.75 0H6.375M5.25 6H9m-3.75 0H6.375" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3.001v11.668c0 .76.43 1.439 1.065 1.765l2.836 1.488A2.025 2.025 0 018.25 17.5V13.5h1.875c.571 0 1.084-.223 1.464-.583l2.836-2.667a1.875 1.875 0 000-2.932l-2.836-2.667A1.875 1.875 0 0010.125 4.5H8.25V3.001A2.25 2.25 0 006  .751H3.75A2.25 2.25 0 001.5 3.001H3z" />
  </svg>
);

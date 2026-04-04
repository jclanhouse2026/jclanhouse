
import React from 'react';

const CrownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5.25L12 2.25 9 5.25l-1.5 9h9L15 5.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 18h13.5" />
  </svg>
);

export default CrownIcon;

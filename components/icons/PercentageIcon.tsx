
import React from 'react';
const PercentageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v.75c0 .414.336.75.75.75h.75m0-1.5h.375c.621 0 1.125.504 1.125 1.125v.375m0-1.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zM16.5 16.5h.75a2.25 2.25 0 002.25-2.25v-.75a.75.75 0 00-.75-.75h-.75m0 1.5h-.375c-.621 0-1.125-.504-1.125-1.125v-.375m0 1.5a.375.375 0 11.75 0 .375.375 0 01-.75 0zM4.5 19.5l15-15" />
  </svg>
);
export default PercentageIcon;
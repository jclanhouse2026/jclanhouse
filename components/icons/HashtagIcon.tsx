import React from 'react';

const HashtagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5m-3.375-11.25L10.5 20.25m3.375-16.5L9 20.25" />
  </svg>
);

export default HashtagIcon;

import React from 'react';

const ClipboardListIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .415.162.798.425 1.081.263.283.627.456 1.03.456s.767-.173 1.03-.456c.263-.283.425-.666.425-1.081 0-.231-.035-.454-.1-.664m-5.801 0A2.251 2.251 0 0 1 11.25 2.25h1.5a2.251 2.251 0 0 1 2.25 2.25m-5.801 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 0 1 1.123-.08" />
  </svg>
);

export default ClipboardListIcon;

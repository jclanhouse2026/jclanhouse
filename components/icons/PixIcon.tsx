
import React from 'react';

const PixIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5l16.5 16.5m0-16.5L3.75 21M12.75 3.75l-4.5 4.5m4.5-4.5l4.5 4.5m-9 9l-4.5 4.5m4.5-4.5l4.5 4.5" />
    </svg>
);

export default PixIcon;

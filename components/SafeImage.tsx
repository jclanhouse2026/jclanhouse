import React from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  fallbackType?: 'avatar' | 'product' | 'default';
}

export const SafeImage: React.FC<SafeImageProps> = ({ src, fallback, fallbackType, alt, className, ...props }) => {
  const getFallbackUrl = () => {
    if (fallback) return fallback;
    
    if (fallbackType === 'avatar') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'User')}&background=0891b2&color=fff`;
    }
    
    if (fallbackType === 'product') {
      return 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=2070&auto=format&fit=crop';
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'User')}&background=0891b2&color=fff`;
  };

  const defaultFallback = getFallbackUrl();
  const imageSrc = src && src.trim() !== '' ? src : defaultFallback;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      {...props}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== defaultFallback) {
          target.src = defaultFallback;
        }
      }}
    />
  );
};

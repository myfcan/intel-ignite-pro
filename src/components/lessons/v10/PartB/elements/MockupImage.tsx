import React from 'react';

interface MockupImageProps {
  src: string;
  alt: string;
}

const MockupImage: React.FC<MockupImageProps> = ({ src, alt }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </div>
  );
};

export default MockupImage;

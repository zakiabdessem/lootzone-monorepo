import Image from 'next/image';
import { useState } from 'react';

import Image from "next/image";
import { useState } from "react";

interface ProductImagesProps {
  image: string;
  gallery?: string[];
}

const ProductImages: React.FC<ProductImagesProps> = ({ image, gallery = [] }) => {
  const [selected, setSelected] = useState(image);

  // Ensure main image is first and unique
  const images = [image, ...gallery.filter(img => img !== image)];

  return (
    <div className='space-y-4'>
      {/* Main image - Standard size 400x400 */}
      <div className='relative w-full max-w-[400px] aspect-square bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg mx-auto'>
        {/* Blurred background */}
        <Image
          src={selected || '/product-placeholder.jpg'}
          alt='Product image blur bg'
          fill
          className='object-cover blur-lg scale-110 absolute inset-0 z-0 pointer-events-none select-none opacity-30'
          style={{ filter: 'blur(20px) brightness(0.8)' }}
          aria-hidden='true'
          unoptimized
        />
        {/* Main image */}
        <Image
          src={selected || '/product-placeholder.jpg'}
          alt='Product image'
          fill
          sizes='400px'
          quality={85}
          className='object-contain relative z-10 p-4'
          style={{ imageRendering: 'auto' }}
          unoptimized
        />
      </div>

      {/* Thumbnails - Standard size 80x80 */}
      {images.length > 1 && (
        <div className='flex gap-3 overflow-x-auto pb-2 max-w-[400px] mx-auto'>
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelected(img)}
              className={`w-20 h-20 relative bg-white border-2 rounded-md overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md ${
                selected === img ? 'border-blue-500 shadow-md ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <Image
                src={img || '/product-placeholder.jpg'}
                alt={`product-${idx + 1}`}
                fill
                sizes='80px'
                quality={75}
                className='object-contain p-1'
                style={{ imageRendering: 'auto' }}
                unoptimized
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;

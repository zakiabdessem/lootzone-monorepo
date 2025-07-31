import Image from 'next/image';
import { useState } from 'react';

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
      {/* Main image */}
      <div className='relative aspect-square bg-[#4618AC] border border-[#63e3c2] overflow-hidden'>
        {/* Blurred background */}
        <Image
          src={selected || '/placeholder.svg'}
          alt='Product image blur bg'
          fill
          className='object-cover blur-lg scale-110 absolute inset-0 z-0 pointer-events-none select-none'
          style={{ filter: 'blur(24px) brightness(0.7)' }}
          aria-hidden='true'
        />
        {/* Main image */}
        <Image
          src={selected || '/placeholder.svg'}
          alt='Product image'
          fill
          sizes='(max-width: 768px) 100vw, 50vw'
          quality={90}
          className='object-contain relative z-10'
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className='flex gap-2 overflow-x-auto'>
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelected(img)}
              className='w-20 h-20 relative bg-[#4618AC] border border-[#63e3c2] overflow-hidden flex-shrink-0 cursor-pointer'
            >
              <Image
                src={img || '/placeholder.svg'}
                alt={`product-${idx}`}
                fill
                sizes='80px'
                quality={80}
                className='object-cover'
                style={{ imageRendering: 'auto' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;

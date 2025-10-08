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
  const remainingCount = images.length > 4 ? images.length - 3 : 0;

  return (
    <div className='space-y-3'>
      {/* Main image - Large, fills container */}
      <div className='relative w-full aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg overflow-hidden shadow-md'>
        <Image
          src={selected || '/product-placeholder.jpg'}
          alt='Product image'
          fill
          sizes='(max-width: 768px) 100vw, 600px'
          quality={90}
          className='object-cover'
          unoptimized
        />
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className='grid grid-cols-4 gap-2'>
          {images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelected(img)}
              className={`relative aspect-video bg-gradient-to-br from-gray-100 to-gray-50 rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
                selected === img 
                  ? 'ring-2 ring-[#4618AC] ring-offset-2' 
                  : 'hover:ring-2 hover:ring-gray-300'
              }`}
            >
              {/* Show "+X" overlay on last thumbnail if more images */}
              {idx === 3 && remainingCount > 0 ? (
                <>
                  <Image
                    src={img || '/product-placeholder.jpg'}
                    alt={`product-${idx + 1}`}
                    fill
                    sizes='150px'
                    quality={70}
                    className='object-cover'
                    unoptimized
                  />
                  <div className='absolute inset-0 bg-black/70 flex items-center justify-center'>
                    <span className='text-white text-2xl font-bold'>+{remainingCount}</span>
                  </div>
                </>
              ) : (
                <Image
                  src={img || '/product-placeholder.jpg'}
                  alt={`product-${idx + 1}`}
                  fill
                  sizes='150px'
                  quality={70}
                  className='object-cover'
                  unoptimized
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;

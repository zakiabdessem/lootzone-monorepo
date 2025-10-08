import { useSiteSubAnnouncement } from '~/contexts/SiteSettingsContext';
import Image from 'next/image';
import React from 'react';

const MembershipBadge: React.FC = () => {
  const subAnnouncement = useSiteSubAnnouncement();

  // Don't render if no announcement
  if (!subAnnouncement) {
    return null;
  }

  return (
    <span className='inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/60 backdrop-blur-sm px-3 py-1 text-[12px] font-medium text-gray-700 shadow-sm silver-shimmer'>
      <span className='text-lg leading-none text-gray-700 cursor-pointer'>
        <Image src='https://img.icons8.com/matisse/30/fire.png' alt='fire' width={20} height={20} />
      </span>{' '}
      {subAnnouncement}
    </span>
  );
};

export default MembershipBadge;


import React from 'react';
import Image from 'next/image';
import {
  Gamepad2,
  Monitor,
  Music,
  Video,
  ShoppingCart,
  Gift,
  CreditCard,
  Smartphone,
  Tv,
  Code,
  Palette,
  Shield,
  Globe,
  Star,
  Package,
  Zap
} from 'lucide-react';

// Icon mapping for different category types
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  // Gaming
  games: Gamepad2,
  gaming: Gamepad2,
  steam: Monitor,
  xbox: Gamepad2,
  playstation: Gamepad2,
  nintendo: Gamepad2,
  
  // Entertainment
  netflix: Video,
  spotify: Music,
  disney: Video,
  hulu: Video,
  crunchyroll: Video,
  
  // Tech & Software
  programming: Code,
  adobe: Palette,
  figma: Palette,
  canva: Palette,
  windows: Monitor,
  apple: Monitor,
  
  // Security & Utilities
  antivirus: Shield,
  security: Shield,
  
  // E-commerce & Cards
  giftcards: Gift,
  ecard: CreditCard,
  shopping: ShoppingCart,
  
  // Mobile
  mobile: Smartphone,
  googleplay: Smartphone,
  
  // General
  global: Globe,
  featured: Star,
  popular: Zap,
  utility: Package,
};

interface CategoryIconProps {
  name?: string;
  iconPath?: string | null;
  size?: number;
  className?: string;
  fallback?: React.ComponentType<any>;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = '',
  iconPath,
  size = 24,
  className = '',
  fallback: FallbackIcon = Package
}) => {
  // Try to get icon from mapping first
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const IconComponent = ICON_MAP[normalizedName];
  
  if (IconComponent) {
    return (
      <IconComponent 
        size={size} 
        className={`text-white ${className}`}
        style={{ filter: 'brightness(0) invert(1)' }}
      />
    );
  }
  
  // If we have a valid icon path, try to load it
  if (iconPath && iconPath.startsWith('/')) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <Image
          src={iconPath}
          alt={name}
          width={size}
          height={size}
          className="object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
          onError={(e) => {
            // On error, replace with fallback icon
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <FallbackIcon 
          size={size} 
          className={`text-white hidden absolute inset-0`}
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>
    );
  }
  
  // Final fallback
  return (
    <FallbackIcon 
      size={size} 
      className={`text-white ${className}`}
      style={{ filter: 'brightness(0) invert(1)' }}
    />
  );
};

// Export icon mapping for admin use
export const getAvailableIcons = () => Object.keys(ICON_MAP);

export default CategoryIcon;

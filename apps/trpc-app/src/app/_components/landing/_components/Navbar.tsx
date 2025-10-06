'use client';

import { useSmartCategories } from '@/lib/smart-categories';

import { useWishlist } from '@/hooks/useWishlist';
import { useAnnouncement } from '~/contexts/SiteSettingsContext';
// import { useCurrency } from "~/contexts/SiteSettingsContext";
import { Heart, Search, ShoppingCart, User, X, Home, Store, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
// @ts-ignore - StaggeredMenu exists but TypeScript configuration issue
import StaggeredMenu from './StaggeredMenu';
import Dock from './Dock';

const categories = [
  { id: 'categories', label: 'Categories' },
  { id: 'shop', label: 'Shop' },
  { id: 'cheap-games', label: 'Cheap Games' },
  { id: 'trending', label: 'Trending Now' },
  { id: 'deals', label: 'Deals' },
];

export function Navbar() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDock, setShowDock] = useState(true);
  // const currency = useCurrency();
  const currency = 'DZD'; // Default currency
  const announcement = useAnnouncement();
  const smartCategories = useSmartCategories();
  const { ids, mergeGuestToServer, isAuthenticated } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      void mergeGuestToServer();
    }
  }, [isAuthenticated, mergeGuestToServer]);

  // Hide dock when near footer or scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) {
        setShowDock(true);
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Hide dock if footer is visible in viewport (with 100px buffer)
      const isFooterVisible = footerRect.top < windowHeight + 100;
      
      setShowDock(!isFooterVisible);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prepare menu items from smart categories
  const menuItems = useMemo(() => {
    if (!smartCategories) return [];

    const items = [];

    // Add main categories and their children
    for (const category of smartCategories) {
      items.push({
        label: category.name,
        ariaLabel: `View ${category.name} products`,
        link: `/products?category=${category.id}`,
      });

      // Add children
      if (category.children && category.children.length > 0) {
        for (const child of category.children) {
          items.push({
            label: child.name,
            ariaLabel: `View ${child.name} products`,
            link: `/products?category=${child.category ?? child.id}`,
          });
        }
      }
    }

    return items;
  }, [smartCategories]);

  // Dock items for mobile
  const dockItems = useMemo(() => [
    {
      icon: <Home size={22} strokeWidth={2} />,
      label: 'Home',
      onClick: () => router.push('/'),
    },
    {
      icon: <Store size={22} strokeWidth={2} />,
      label: 'Shop',
      onClick: () => router.push('/products'),
    },
    {
      icon: <Heart size={22} strokeWidth={2} />,
      label: 'Wishlist',
      onClick: () => router.push('/wishlist'),
      badge: ids.length,
    },
    {
      icon: <ShoppingCart size={22} strokeWidth={2} />,
      label: 'Cart',
      onClick: () => router.push('/cart'),
      badge: 0, // Replace with actual cart count
    },
  ], [router, ids.length]);

  return (
    <nav
      className='w-full bg-white text-gray-900'
      style={{
        boxSizing: 'border-box',
        borderWidth: '0 0 1px 0',
        borderStyle: 'solid',
        borderColor: '#e5e7eb',
      }}
    >
      {/* Fixed Wrapper containing announcement + main nav */}
      <div className='fixed top-0 left-0 right-0 z-[5] w-full'>
        {announcement && showAnnouncement && (
          <div className='w-full bg-gradient-to-r from-[#6d3be8] via-[#4618AC] to-[#2d0e5e] text-white text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 py-2 px-4 text-center relative'>
            <div dangerouslySetInnerHTML={{ __html: announcement.html }} />
            <button
              className='absolute lg:right-2 right-4 top-2'
              onClick={() => setShowAnnouncement(false)}
              aria-label='Close announcement'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        )}

        {/* Main Navbar */}
        <div
          className='lg:px-12 bg-white border-b border-gray-200 max-md:h-16 h-20'
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <div className='flex items-center justify-between w-full max-md:px-6'>
            {/* Logo */}
            <Link href='/' className='flex items-center space-x-2'>
              {/* Mobile logo - now using horizontal logo */}
              <Image
                src='/logo-horizontal.png'
                alt='LOOT'
                width={120}
                height={48}
                className='block md:hidden'
              />

              {/* Desktop / tablet horizontal logo */}
              <Image
                src='/logo-horizontal.png'
                alt='LOOT'
                width={180}
                height={64}
                className='hidden md:block'
              />
            </Link>

            {/* Search Bar (hidden on mobile) */}
            <div className='hidden md:block flex-1 max-w-2xl mx-8'>
              <div className='relative transition-all duration-200'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Search for games, top-ups and more'
                  className='w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 border-[1px] border-gray-200 focus:ring-[#4618AC]'
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className='flex items-center space-x-4'>
              {/* Wishlist - hidden on mobile */}
              <Link href='/wishlist' className='relative hidden md:block'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-gray-700 hover:bg-gray-100 cursor-pointer'
                  aria-label='Wishlist'
                >
                  <Heart className='h-5 w-5' />
                </Button>
                {ids.length > 0 && (
                  <span className='absolute -top-1 -right-1 bg-[#4618AC] text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none'>
                    {ids.length}
                  </span>
                )}
              </Link>

              {/* Login button - hidden on mobile */}
              <Button className='hidden md:flex space-x-1 hover:bg-gray-100 cursor-pointer'>
                <User className='h-5 w-5' />
                <span>Log in</span>
              </Button>

              {/* Cart - hidden on mobile */}
              <Button variant='secondary' className='hidden md:flex space-x-1 cursor-pointer'>
                <ShoppingCart className='h-5 w-5' />
                <span>0</span>
                <span>{currency}</span>
              </Button>

              {/* Mobile Menu Button - moved to the right */}
              <div className='md:hidden'>
                <StaggeredMenu
                  position="right"
                  items={menuItems}
                  socialItems={[]}
                  displaySocials={false}
                  displayItemNumbering={true}
                  menuButtonColor="#4618AC"
                  openMenuButtonColor="#000"
                  changeMenuColorOnOpen={true}
                  colors={['#B19EEF', '#4618AC', '#6b2fd9']}
                  logoUrl="/logo.png"
                  accentColor="#23c299"
                  onMenuOpen={() => setIsMenuOpen(true)}
                  onMenuClose={() => setIsMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Panel */}
        {mobileSearchOpen && (
          <div className='md:hidden bg-white border-b border-gray-200 px-6 py-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                type='text'
                placeholder='Search for games, top-ups and more'
                className='w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 border-[1px] border-gray-200 focus:ring-[#4618AC]'
              />
            </div>
          </div>
        )}
      </div>

      {/* Categories Bar (Desktop) */}
      <div
        className='hidden md:block bg-gray-50/20 py-4'
        style={{ marginTop: showAnnouncement ? '112px' : '80px' }}
      >
        <div className='lg:mx-12 px-4'>
          <div className='flex items-center space-x-6 -my-4'>
            <div>
              <StaggeredMenu
                position="left"
                items={menuItems}
                socialItems={[]}
                displaySocials={false}
                displayItemNumbering={true}
                menuButtonColor="#4618AC"
                openMenuButtonColor="#000"
                changeMenuColorOnOpen={true}
                colors={['#B19EEF', '#4618AC', '#6b2fd9']}
                logoUrl="/logo-horizontal.png"
                accentColor="#23c299"
                onMenuOpen={() => setIsMenuOpen(true)}
                onMenuClose={() => setIsMenuOpen(false)}
              />
            </div>
            {categories.slice(1).map(category => (
              <Link key={category.id} href={`/${category.id}`}>
                <Button
                  variant='ghost'
                  className='text-gray-900 hover:bg-gray-100 h-auto px-2 text-sm py-4 font-medium'
                >
                  {category.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Dock Navigation - Hide when menu is open or near footer */}
      {!isMenuOpen && showDock && (
        <div className="md:hidden">
          <Dock 
            items={dockItems}
            panelHeight={68}
            baseItemSize={52}
            magnification={65}
            distance={140}
          />
        </div>
      )}
    </nav>
  );
}

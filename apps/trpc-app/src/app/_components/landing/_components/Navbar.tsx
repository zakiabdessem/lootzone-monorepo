'use client';

import { useSmartCategories } from '@/lib/smart-categories';
import { formatDA } from '@/lib/utils';

import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAnnouncement } from '~/contexts/SiteSettingsContext';
// import { useCurrency } from "~/contexts/SiteSettingsContext";
import { Heart, Search, ShoppingCart, User, X, Home, Store, Sparkles, PackageSearch, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, useRef, useCallback, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
// @ts-ignore - StaggeredMenu exists but TypeScript configuration issue
import StaggeredMenu from './StaggeredMenu';
import Dock from './Dock';
import { api } from '~/trpc/react';

const categories = [
  { id: 'categories', label: 'Categories' },
  { id: 'products', label: 'Shop' },
  { id: 'cheap-games', label: 'Cheap Games' },
  { id: 'trending', label: 'Trending Now' },
  { id: 'deals', label: 'Deals' },
];

type SearchProduct = {
  id: string;
  title: string;
  slug?: string | null;
  image: string;
  region: string;
  price?: number;
  originalPrice?: number;
  badge?: string;
  tags: string[];
  highlightedTitle?: string | null;
};

const TRENDING_QUERIES = [
  'Netflix',
  'Chatgpt Plus',
  'Adobe',
  'Snapchat plus',
  'Coursera',
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatHighlightedText = (value: string) =>
  value
    .replace(/<em>/g, "<span class='text-[#fad318]'>")
    .replace(/<\/em>/g, '</span>');

const highlightMatches = (text: string, term: string) => {
  if (!term) {
    return text;
  }

  const pattern = new RegExp(`(${escapeRegExp(term)})`, 'ig');
  const segments = text.split(pattern);

  return segments.map((segment, index) => {
    const isMatch = segment.toLowerCase() === term.toLowerCase();
    return (
      <span
        key={`${segment}-${index}`}
        className={isMatch ? 'text-[#fad318]' : undefined}
      >
        {segment}
      </span>
    );
  });
};

function SearchResultCard({
  product,
  query,
  onSelect,
}: {
  product: SearchProduct;
  query: string;
  onSelect: (term: string) => void;
}) {
  return (
    <button
      type='button'
      onClick={() => onSelect(product.title)}
      className='group relative flex w-full items-center overflow-hidden rounded-xl border border-[#63e3c2]/40 bg-[#2c1269] text-left transition hover:border-[#63e3c2] hover:bg-[#34157d] focus:outline-none focus:ring-2 focus:ring-[#63e3c2] focus:ring-offset-2 focus:ring-offset-[#120932]'
    >
      <div className='relative flex h-full items-center justify-center bg-[#1b0b48] px-3 py-2'>
        <Image
          src={product.image}
          alt={product.title}
          width={70}
          height={70}
          className='h-[58px] w-[58px] rounded-md object-cover shadow-lg'
        />
      </div>

      <div className='flex flex-1 flex-col gap-1 px-3 py-2'>
        <div className='flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#63e3c2]'>
          {product.badge && (
            <span className='rounded-full bg-[#63e3c2]/15 px-2 py-[2px] text-[9px] font-semibold text-[#63e3c2]'>
              {product.badge}
            </span>
          )}
          <span className='text-[#23c299]'>{product.region}</span>
        </div>
        <p className='line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-[#fad318]'>
          {product.highlightedTitle ? (
            <span dangerouslySetInnerHTML={{ __html: formatHighlightedText(product.highlightedTitle) }} />
          ) : query ? (
            highlightMatches(product.title, query)
          ) : (
            product.title
          )}
        </p>
        <div className='flex items-baseline gap-2 text-xs text-gray-300'>
          <span className='text-base font-bold text-white'>
            {typeof product.price === 'number' ? formatDA(product.price) : 'See details'}
          </span>
          {typeof product.originalPrice === 'number' && typeof product.price === 'number' && (
            <span className='line-through'>{formatDA(product.originalPrice)}</span>
          )}
        </div>
      </div>

      <span className='pr-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fad318]'>View</span>
    </button>
  );
}

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
  const { itemCount, subtotal } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Hide search bar and mobile dock on products page
  const isProductsPage = pathname === '/products';
  const desktopSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  const trimmedQuery = searchQuery.trim();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(trimmedQuery), 200);
    return () => window.clearTimeout(timeoutId);
  }, [trimmedQuery]);

  const shouldSearch = debouncedQuery.length > 0;

  const searchProducts = api.search.products.useQuery(
    { query: debouncedQuery, limit: 6 },
    {
      enabled: shouldSearch,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      retry: false,
    },
  );

  const popularProducts = api.search.popular.useQuery(
    { limit: 3 },
    {
      enabled: isSearchActive,
      refetchOnWindowFocus: false,
      staleTime: 300_000,
      retry: false,
    },
  );

  const searchResults: SearchProduct[] = searchProducts.data ?? [];
  const defaultSuggestions: SearchProduct[] = popularProducts.data ?? [];
  const isSearchLoading = searchProducts.isLoading;
  const isSearching = searchProducts.isFetching;
  const searchError = searchProducts.error;
  const suggestionsLoading = popularProducts.isLoading || popularProducts.isFetching;
  const suggestionsError = popularProducts.error;

  const closeSearch = useCallback(() => {
    setIsSearchActive(false);
    setMobileSearchOpen(false);
  }, []);

  const navigateToQuery = (term: string) => {
    const cleaned = term.trim();
    if (!cleaned) {
      return;
    }

    router.push(`/products?q=${encodeURIComponent(cleaned)}`);
    setSearchQuery('');
    closeSearch();
  };

  const handleSearchSubmit = () => navigateToQuery(searchQuery);
  const handleSelectProduct = (term: string) => navigateToQuery(term);
  const handleSelectSuggestion = (term: string) => navigateToQuery(term);

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchSubmit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      (event.target as HTMLInputElement).blur();
    }
  };

  const renderSearchPanel = (placement: 'desktop' | 'mobile') => {
    if (!isSearchActive) {
      return null;
    }

    const containerClasses =
      placement === 'desktop'
        ? 'absolute left-0 right-0 top-[calc(100%+0.75rem)]'
        : 'mt-3';

    const scrollBounds = placement === 'desktop' ? 'max-h-[420px]' : 'max-h-[60vh]';
    const hasQuery = trimmedQuery.length > 0;
    const hasResults = searchResults.length > 0;
    const searchErrorMessage = searchError?.message ?? 'Unable to search products right now.';
    const suggestionsErrorMessage = suggestionsError?.message ?? 'Unable to load suggestions.';

    return (
      <div
        className={`${containerClasses} z-[60] rounded-sm border border-[#2d0e5e] bg-gradient-to-b from-[#1a1040] via-[#120832] to-[#0b031f] shadow-2xl`}
      >
        <div className={`search-panel-scroll flex flex-col gap-4 ${scrollBounds} overflow-y-auto p-4`}>
          <div className='flex items-center justify-between gap-2 text-xs uppercase tracking-[0.16em] text-[#63e3c2]'>
            <span>{hasQuery ? 'Matching results' : 'Quick search'}</span>
            {hasQuery ? (
              <div className='flex items-center gap-2'>
                {isSearching && <Loader2 className='h-3 w-3 animate-spin text-[#63e3c2]' />}
                <button
                  type='button'
                  onClick={handleSearchSubmit}
                  className='rounded-full border border-[#63e3c2]/40 px-3 py-1 text-[10px] font-semibold uppercase text-[#fad318] transition hover:border-[#63e3c2] hover:text-white'
                >
                  View all
                </button>
              </div>
            ) : null}
          </div>

          {hasQuery ? (
            isSearchLoading ? (
              <div className='flex items-center justify-center gap-3 rounded-2xl border border-[#63e3c2]/30 bg-[#0e0527] px-6 py-10 text-sm text-[#63e3c2]'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>Searching products…</span>
              </div>
            ) : searchProducts.isError ? (
              <div className='flex items-center gap-3 rounded-2xl border border-[#f87171]/30 bg-[#2c1269] px-6 py-8 text-sm text-[#fca5a5]'>
                <AlertCircle className='h-5 w-5 text-[#f87171]' />
                <span>{searchErrorMessage}</span>
              </div>
            ) : hasResults ? (
              <div className='grid gap-2'>
                 {searchResults.map(product => (
                   <SearchResultCard
                     key={product.id}
                     product={product}
                     query={trimmedQuery}
                     onSelect={handleSelectProduct}
                   />
                 ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#63e3c2]/30 bg-[#0e0527] px-6 py-10 text-center text-sm text-gray-300'>
                <PackageSearch className='h-8 w-8 text-[#63e3c2]' />
                <p>
                  No direct matches for “{searchQuery}” yet. Try another keyword or explore the trending picks below.
                </p>
                <div className='flex flex-wrap justify-center gap-2'>
                  {TRENDING_QUERIES.map(term => (
                    <button
                      key={`empty-${term}`}
                      type='button'
                      onClick={() => handleSelectSuggestion(term)}
                      className='rounded-full border border-[#63e3c2]/40 px-3 py-1 text-xs text-[#63e3c2] transition hover:border-[#63e3c2] hover:bg-[#2c1269]'
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-2 text-sm font-semibold text-[#fad318]'>
                  <Sparkles className='h-4 w-4' />
                  <span>Trending searches</span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {TRENDING_QUERIES.map(term => (
                    <button
                      key={term}
                      type='button'
                      onClick={() => handleSelectSuggestion(term)}
                      className='rounded-full border border-[#63e3c2]/30 bg-[#1a0d44] px-3 py-1 text-xs text-[#63e3c2] transition hover:border-[#63e3c2] hover:bg-[#342070]'
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <p className='text-xs uppercase tracking-[0.18em] text-[#63e3c2]/80'>Popular right now</p>
                {suggestionsLoading ? (
                  <div className='flex items-center gap-2 rounded-2xl border border-[#63e3c2]/30 bg-[#1a0d44] px-4 py-4 text-xs text-[#63e3c2]'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Fetching picks…</span>
                  </div>
                ) : suggestionsError ? (
                  <div className='flex items-center gap-2 rounded-2xl border border-[#f87171]/30 bg-[#1a0d44] px-4 py-4 text-xs text-[#fca5a5]'>
                    <AlertCircle className='h-4 w-4 text-[#f87171]' />
                    <span>{suggestionsErrorMessage}</span>
                  </div>
                 ) : defaultSuggestions.length > 0 ? (
                   defaultSuggestions.map(product => (
                     <SearchResultCard
                       key={`suggested-${product.id}`}
                       product={product}
                       query=''
                       onSelect={handleSelectProduct}
                     />
                   ))
                ) : (
                  <p className='rounded-2xl bg-[#1a0d44] px-4 py-4 text-xs text-gray-300'>
                    No popular picks yet. Try a search to explore.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

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

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (!isSearchActive) {
        return;
      }

      const target = event.target as Node;
      const clickedDesktop = desktopSearchRef.current?.contains(target) ?? false;
      const clickedMobile = mobileSearchRef.current?.contains(target) ?? false;

      if (clickedDesktop || clickedMobile) {
        return;
      }

      closeSearch();
    };

    const handleMouseDown = (event: MouseEvent) => handleClickOutside(event);
    const handleTouchStart = (event: TouchEvent) => handleClickOutside(event);

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [closeSearch, isSearchActive]);

  useEffect(() => {
    if (!mobileSearchOpen) {
      return;
    }

    setIsSearchActive(true);

    const timeoutId = window.setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [mobileSearchOpen]);

  // Prepare menu items from smart categories
  const menuItems = useMemo(() => {
    if (!smartCategories) return [];

    const items = [];

    // Add main categories and their children
    for (const category of smartCategories) {
      // For parent categories, create link with all children slugs
      const childrenSlugs = category.children?.map(child => {
        // Convert category name to slug format (lowercase, replace spaces with hyphens)
        const categoryName = child.category ?? child.name;
        return categoryName.toLowerCase().replace(/\s+/g, '-');
      }) || [];
      
      const catsParam = childrenSlugs.length > 0 ? `&cats=${childrenSlugs.join('%2C')}` : '';
      
      items.push({
        label: category.name,
        ariaLabel: `View ${category.name} products`,
        link: `/products?category=${category.id}${catsParam}`,
      });

      // Add children
      if (category.children && category.children.length > 0) {
        for (const child of category.children) {
          const childSlug = (child.category ?? child.name).toLowerCase().replace(/\s+/g, '-');
          items.push({
            label: child.name,
            ariaLabel: `View ${child.name} products`,
            link: `/products?cats=${childSlug}`,
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
      badge: itemCount,
    },
  ], [router, ids.length, itemCount]);

  return (
    <>
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

            {/* Search Bar (hidden on mobile and products page) */}
            {!isProductsPage && (
              <div className='hidden md:block flex-1 max-w-2xl mx-8'>
                <div ref={desktopSearchRef} className='relative transition-all duration-200'>
                  <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    ref={desktopSearchInputRef}
                    type='text'
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    onFocus={() => setIsSearchActive(true)}
                    onKeyDown={handleSearchKeyDown}
                    autoComplete='off'
                    aria-autocomplete='list'
                    aria-expanded={isSearchActive}
                    placeholder='Search for games, top-ups and more'
                    className='w-full rounded-sm border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-gray-900 shadow-sm transition focus:border-[#4618AC] focus:bg-white focus:ring-[#4618AC]'
                  />
                  {renderSearchPanel('desktop')}
                </div>
              </div>
            )}

            {/* Right Side Actions */}
            <div className='flex items-center space-x-4'>
              {/* Mobile Search Button (hidden on products page) */}
              {!isProductsPage && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='md:hidden text-gray-700 hover:bg-gray-100 cursor-pointer'
                  aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
                  onClick={() => {
                    if (mobileSearchOpen) {
                      closeSearch();
                      setSearchQuery('');
                    } else {
                      setMobileSearchOpen(true);
                      setIsSearchActive(true);
                    }
                  }}
                >
                  {mobileSearchOpen ? <X className='h-5 w-5' /> : <Search className='h-5 w-5' />}
                </Button>
              )}

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
              {/* <Button className='hidden md:flex space-x-1 hover:bg-gray-100 cursor-pointer'>
                <User className='h-5 w-5' />
                <span>Log in</span>
              </Button> */}

              {/* Cart - hidden on mobile */}
              <Link href='/cart'>
                <Button variant='secondary' className='hidden md:flex space-x-1 cursor-pointer relative'>
                  <ShoppingCart className='h-5 w-5' />
                  <span>{formatDA(subtotal)}</span>
                  {/* {itemCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-[#4618AC] text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none'>
                      {itemCount}
                    </span>
                  )} */}
                </Button>
              </Link>

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

        {/* Mobile Search Panel (hidden on products page) */}
        {mobileSearchOpen && !isProductsPage && (
          <div className='md:hidden bg-white border-b border-gray-200 px-6 py-2'>
            <div ref={mobileSearchRef} className='relative'>
              <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                ref={mobileSearchInputRef}
                type='text'
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchActive(true)}
                onKeyDown={handleSearchKeyDown}
                autoComplete='off'
                placeholder='Search for games, top-ups and more'
                className='w-full rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-gray-900 shadow-sm focus:border-[#4618AC] focus:bg-white focus:ring-[#4618AC]'
              />
              {renderSearchPanel('mobile')}
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

      {/* Mobile Dock Navigation - Hide when menu is open, near footer, or on products page */}
      {!isMenuOpen && showDock && !isProductsPage && (
        <div className="md:hidden cursor-pointer">
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
      <style jsx global>{`
        .search-panel-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .search-panel-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .search-panel-scroll::-webkit-scrollbar-track,
        .search-panel-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border: none;
        }
      `}</style>
    </>
  );
}

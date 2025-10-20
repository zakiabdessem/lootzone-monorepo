'use client';

// @ts-nocheck
import { PackageSearch, Search, Loader2, AlertCircle, Sparkles, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Region } from '~/constants/enums';
import { api } from '~/trpc/react';
import { CategoryFilter } from '../_components/landing/product/CategoryFilter';
import { CollapsibleSection } from '../_components/landing/product/CollapsibleSection';
import { ProductCard } from '../_components/landing/product/ProductCard';
import { Checkbox } from '../_components/landing/ui/checkbox';
import { Input } from '../_components/landing/ui/input';
import { ScrollArea } from '../_components/landing/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../_components/landing/ui/select';
import Image from 'next/image';
import { formatDA } from '@/lib/utils';

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSort = searchParams.get('sort') || 'POPULARITY_DESC';
  const initialRegion = searchParams.get('region') || 'all';

  const [sort, setSort] = useState(initialSort);
  const [region, setRegion] = useState(initialRegion);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Search query state
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 200);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  // Algolia search
  const shouldSearch = debouncedQuery.length > 0;
  const algoliaSearch = api.search.products.useQuery(
    { query: debouncedQuery, limit: 20 },
    {
      enabled: shouldSearch,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      retry: false,
    },
  );

  const algoliaResults = algoliaSearch.data ?? [];

  // 🐛 DEBUG: Log Algolia results
  useEffect(() => {
    if (shouldSearch && algoliaResults.length > 0) {
      console.log('🔍 [ProductsClient] Algolia search results:', algoliaResults);
      console.log('🔍 [ProductsClient] First result variants:', algoliaResults[0]?.variants);
    }
  }, [algoliaResults, shouldSearch]);

  // Sync helpers
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const initialCatsArray = (searchParams.get('cats') || '').split(',').filter(Boolean);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(initialCatsArray));

  const updateCatsParam = (set: Set<string>) => {
    const params = new URLSearchParams(window.location.search);
    if (set.size) params.set('cats', Array.from(set).join(','));
    else params.delete('cats');
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    updateCatsParam(selectedCats);
  }, [selectedCats]);

  // Fetch categories to check loading state
  const { isLoading: categoriesLoading } = api.category.getSmart.useQuery();
  
  // Fetch products
  const { data, isLoading } = api.product.list.useQuery({
    region: region !== 'all' ? (region as Region) : undefined,
    limit: 60,
  });

  // Determine which products to display
  const useAlgoliaResults = shouldSearch;
  const displayProducts = useAlgoliaResults ? algoliaResults : (data?.items ?? []);
  
  // 🐛 DEBUG: Log display source
  console.log('🔍 [ProductsClient] Using Algolia results:', useAlgoliaResults);
  console.log('🔍 [ProductsClient] Display products count:', displayProducts.length);
  
  const filteredProducts = displayProducts.filter(p => {
    let matches = true;
    
    // Don't apply additional search filter if using Algolia (already filtered)
    if (!useAlgoliaResults && searchQuery) {
      matches = matches && p.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    // Filter by selected categories
    if (selectedCats.size > 0) {
      matches =
        matches &&
        (p.categories?.some(
          (categoryRelation: any) =>
            categoryRelation?.category?.slug && selectedCats.has(categoryRelation.category.slug)
        ) ?? false);
    }
    
    return matches;
  });

  // Helper to clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setRegion('all');
    setSelectedCats(new Set());
    setSort('POPULARITY_DESC');

    const params = new URLSearchParams(window.location.search);
    ['q', 'region', 'cats', 'sort'].forEach(k => params.delete(k));
    router.push(`?${params.toString()}`);
  };

  const applyFilters = () => {
    setIsMobileFiltersOpen(false);
  };

  // Prevent body scroll when mobile filters open
  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileFiltersOpen]);

  const NotFound: React.FC = () => (
    <div className='flex flex-col items-center justify-center text-center py-24'>
      <PackageSearch color='#4618AC' className='w-12 h-12 text-gray-400 mb-4' />
      <h3 className='text-xl font-bold mb-2'>Oops! No Products Found 🤔</h3>
      <p className='text-sm text-gray-600 max-w-sm mb-6'>
        No products match your current filters. Try adjusting them or clear filters to start over.
        ✨
      </p>
      <button
        onClick={clearFilters}
        className='bg-[#4618AC] hover:bg-[#381488] text-white px-6 py-2 rounded text-sm font-semibold'
      >
        CLEAR FILTERS
      </button>
    </div>
  );

  const FilterContent = useMemo(() => (
    <>
      <h2 className='text-lg font-bold text-[#212121]'>Filter Products</h2>

      {/* Search bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
          type='text'
          placeholder='Search products  🔥'
          value={searchQuery}
          onChange={e => {
            const val = e.target.value;
            setSearchQuery(val);
            updateParam('q', val);
          }}
          className='w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 focus:ring-[#4618AC]'
        />
        {algoliaSearch.isFetching && debouncedQuery.length > 0 && (
          <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#4618AC]' />
        )}
      </div>

      {/* Region select */}
      <CollapsibleSection title='Region' defaultOpen>
        {categoriesLoading ? (
          <div className='h-10 bg-gray-200 rounded animate-pulse' />
        ) : (
          <Select
            value={region}
            onValueChange={(val: any) => {
              setRegion(val);
              updateParam('region', val);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All regions</SelectItem>
              <SelectItem value={Region.GLOBAL}>Global</SelectItem>
              <SelectItem value={Region.EU}>Europe</SelectItem>
              <SelectItem value={Region.US}>United States</SelectItem>
              <SelectItem value={Region.ASIA}>Asia</SelectItem>
              <SelectItem value={Region.NA}>North America</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CollapsibleSection>

      {/* Categories */}
      <CollapsibleSection title='Categories' defaultOpen>
        <CategoryFilter selectedCats={selectedCats} setSelectedCats={setSelectedCats} />
      </CollapsibleSection>
    </>
  ), [searchQuery, algoliaSearch.isFetching, debouncedQuery, categoriesLoading, region, selectedCats]);

  return (
    <div className='min-h-screen bg-[#f8f7ff] text-[#212121] py-12 relative z-0 max-sm:mt-18'>
      <div className='max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 px-4'>
        {/* Desktop Sidebar */}
        <aside className='space-y-6 bg-white border border-gray-200 shadow-sm p-6 lg:sticky lg:top-24 h-max rounded-sm hidden lg:block'>
          {FilterContent}
        </aside>

        {/* Mobile Filter Panel */}
        {isMobileFiltersOpen && (
          <>
            {/* Backdrop - clickable overlay */}
            <div 
              className='fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm'
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            
            {/* Filter Panel - Slide from left */}
            <div className='fixed left-0 top-0 bottom-0 w-[85%] max-w-[320px] z-50 lg:hidden transform transition-transform duration-300 ease-out'>
              <div className='bg-white flex flex-col h-full shadow-2xl'>
                {/* Header */}
                <div className='flex items-center justify-between border-b border-gray-200 p-4 bg-gradient-to-r from-[#4618AC] to-[#5a2db8]'>
                  <h2 className='text-lg font-bold text-white'>Filters</h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className='text-white hover:text-gray-200 transition'
                    aria-label='Close filters'
                  >
                    <X className='h-6 w-6' />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className='flex-1 overflow-y-auto p-4 space-y-6'>
                  {FilterContent}
                </div>

                {/* Footer Actions */}
                <div className='border-t border-gray-200 p-4 flex gap-3 bg-gray-50'>
                  <button
                    onClick={clearFilters}
                    className='flex-1 bg-white hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm font-semibold transition border border-gray-300'
                  >
                    🔄 RESET
                  </button>
                  <button
                    onClick={applyFilters}
                    className='flex-1 bg-[#4618AC] hover:bg-[#381488] text-white px-4 py-3 rounded-lg text-sm font-semibold transition shadow-md'
                  >
                    ✨ APPLY
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Products grid */}
        <main className='flex flex-col'>
          <ScrollArea className='h-[calc(100vh-200px)] pr-1'>
            <div className='pb-10'>
              {/* Top bar for sort on mobile */}
              <div className='flex justify-between items-center mb-6 lg:hidden'>
                <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className='bg-white border border-gray-300 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition'
                >
                  🔍 Filters
                </button>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className='bg-white border border-gray-300 px-4 py-2 rounded text-sm'
                >
                  <option value='POPULARITY_DESC'>Most popular</option>
                  <option value='PRICE_ASC'>Price: Low to High</option>
                  <option value='PRICE_DESC'>Price: High to Low</option>
                </select>
              </div>

              {/* Results count */}
              <p className='text-sm mb-4'>
                Showing <span className='font-semibold'>{filteredProducts.length}</span>{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
                {useAlgoliaResults && debouncedQuery && (
                  <span className='text-gray-500'> for "{debouncedQuery}"</span>
                )}
              </p>

              {(isLoading || (useAlgoliaResults && algoliaSearch.isLoading)) ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {Array.from({ length: 15 }).map((_, idx) => (
                    <div key={idx} className='w-[200px] h-[395px] bg-gray-200 animate-pulse' />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <NotFound />
              ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {filteredProducts.map((product, idx) => (
                    <ProductCard key={idx} {...(product as any)} platformShow={true} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
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
    </div>
  );
}

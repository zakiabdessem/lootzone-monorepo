'use client';

import { PackageSearch, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
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

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSort = searchParams.get('sort') || 'POPULARITY_DESC';
  const initialRegion = searchParams.get('region') || 'all';

  const [sort, setSort] = useState(initialSort);
  const [region, setRegion] = useState(initialRegion);

  // Search query state
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

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

  // Fetch products
  const { data, isLoading } = api.product.list.useQuery({
    region: region !== 'all' ? (region as Region) : undefined,
    limit: 60,
  });
  const filteredProducts = (data?.items ?? []).filter(p => {
    let matches = true;
    if (searchQuery) {
      matches = matches && p.title.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <div className='min-h-screen bg-[#f8f7ff] text-[#212121] py-12'>
      <div className='max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 px-4'>
        {/* Sidebar */}
        <aside className='space-y-6 bg-white border border-gray-200 shadow-sm p-6 lg:sticky lg:top-24 h-max rounded-sm  hidden lg:block'>
          <h2 className='text-lg font-bold text-[#212121]'>Filter Products</h2>

          {/* Search bar */}
          <div>
            <div className='relative transition-all duration-200'>
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
            </div>
          </div>

          {/* Region select */}
          <CollapsibleSection title='Region' defaultOpen>
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
          </CollapsibleSection>

          {/* Product type */}
          <CollapsibleSection title='Product type' defaultOpen>
            {['DLC', 'Game points', 'Game', 'Gaming eCards'].map((type, idx) => (
              <label key={idx} className='flex items-center gap-2 cursor-pointer text-sm'>
                <Checkbox />
                {type}
              </label>
            ))}
          </CollapsibleSection>

          {/* Categories */}
          <CollapsibleSection title='Categories' defaultOpen>
            <CategoryFilter selectedCats={selectedCats} setSelectedCats={setSelectedCats} />
          </CollapsibleSection>
        </aside>

        {/* Products grid */}
        <main className='flex flex-col'>
          <ScrollArea className='h-[calc(100vh-200px)] pr-1'>
            <div className='pb-10'>
              {/* Top bar for sort on mobile */}
              <div className='flex justify-between items-center mb-6 lg:hidden'>
                <button className='bg-white border border-gray-300 px-4 py-2 rounded text-sm'>
                  Filters
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
                {filteredProducts.length === 1 ? 'product' : 'products'}{' '}
              </p>

              {isLoading ? (
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
    </div>
  );
}

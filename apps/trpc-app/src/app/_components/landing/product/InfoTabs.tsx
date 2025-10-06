import siteSettings from '@/lib/site-settings.json';
import type { Product } from '~/types/product';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SpotlightCard from './SpotlightCard';

export interface InfoTabsProps {
  deliveryInfo?: Product['deliveryInfo'];
  deliverySteps?: Product['deliverySteps'];
  terms?: Product['terms'];
  importantNotes?: Product['importantNotes'];
}

const ListDot = () => <div className='w-1.5 h-1.5 rounded-full bg-[#23c299] shadow-sm shadow-[#23c299]/50' />;
const StepNumber = ({ n }: { n: number }) => (
  <div className='w-7 h-7 rounded-full bg-gradient-to-br from-[#4618AC] to-[#6b2fd9] text-white flex items-center justify-center text-xs font-bold shadow-md'>
    {n}
  </div>
);

const InfoTabs: React.FC<InfoTabsProps> = ({
  deliveryInfo = siteSettings.defaultProduct.deliveryInfo,
  deliverySteps = siteSettings.defaultProduct.deliverySteps,
  terms = siteSettings.defaultProduct.terms,
  importantNotes = siteSettings.defaultProduct.importantNotes,
}) => {
  return (
    <div className='bg-gradient-to-br from-[#f8f7ff] to-white py-8'>
      <Tabs defaultValue='delivery' className='w-full px-2'>
        <TabsList className='w-full flex mb-6 bg-transparent border-b-2 border-gray-200'>
          <TabsTrigger
            value='delivery'
            className='px-8 py-3 text-sm font-semibold text-gray-500 -mb-[2px] rounded-none border-b-2 border-transparent data-[state=active]:border-[#4618AC] data-[state=active]:text-[#4618AC] transition-all duration-300 hover:text-[#4618AC]/70'
          >
            🚀 Delivery Info
          </TabsTrigger>
          <TabsTrigger
            value='terms'
            className='px-8 py-3 text-sm font-semibold text-gray-500 -mb-[2px] rounded-none border-b-2 border-transparent data-[state=active]:border-[#4618AC] data-[state=active]:text-[#4618AC] transition-all duration-300 hover:text-[#4618AC]/70'
          >
            📋 Terms
          </TabsTrigger>
        </TabsList>

        {/* Delivery */}
        <TabsContent value='delivery' className='p-0'>
          <SpotlightCard
            className='p-8'
            spotlightColor='rgba(99, 227, 194, 0.25)'
          >
            <div className='space-y-6'>
              <div className='flex items-start gap-3'>
                <div className='text-3xl'>✉️</div>
                <div>
                  <h3 className='text-lg font-bold text-[#212121] mb-2'>Instant Digital Delivery</h3>
                  <p className='text-gray-600 leading-relaxed'>{deliveryInfo}</p>
                </div>
              </div>

              {deliverySteps.length > 0 && (
                <div className='space-y-4'>
                  <h4 className='font-bold text-[#212121] text-base flex items-center gap-2'>
                    <span className='text-xl'>📦</span>
                    How It Works
                  </h4>
                  <div className='grid gap-4'>
                    {deliverySteps.map((step, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#4618AC]/10 hover:border-[#4618AC]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#4618AC]/10'
                      >
                        <StepNumber n={idx + 1} />
                        <span className='text-gray-700 leading-relaxed pt-1'>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SpotlightCard>
        </TabsContent>

        {/* Terms */}
        <TabsContent value='terms' className='p-0'>
          <SpotlightCard
            className='p-8'
            spotlightColor='rgba(70, 24, 172, 0.2)'
          >
            <div className='space-y-6'>
              <div className='flex items-center gap-3'>
                <div className='text-3xl'>⚖️</div>
                <div>
                  <h3 className='text-lg font-bold text-[#212121] mb-2'>Terms & Conditions</h3>
                  <p className='text-gray-600 leading-relaxed'>{terms}</p>
                </div>
              </div>

              {importantNotes.length > 0 && (
                <div className='space-y-4'>
                  <h4 className='font-bold text-[#212121] text-base flex items-center gap-2'>
                    <span className='text-xl'>⚠️</span>
                    Important Notes
                  </h4>
                  <ul className='grid gap-3'>
                    {importantNotes.map((note, idx) => (
                      <li
                        key={idx}
                        className='flex items-center gap-3 p-3 bg-gradient-to-r from-[#23c299]/5 to-transparent rounded-lg border-l-4 border-[#23c299] hover:from-[#23c299]/10 transition-colors duration-300'
                      >
                        <ListDot />
                        <span className='text-gray-700 leading-relaxed'>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SpotlightCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfoTabs;

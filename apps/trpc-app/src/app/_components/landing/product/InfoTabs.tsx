import siteSettings from '@/lib/site-settings.json';
import type { Product } from '~/types/product';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export interface InfoTabsProps {
  description: Product['description'];
  keyFeatures?: Product['keyFeatures'];
  deliveryInfo?: Product['deliveryInfo'];
  deliverySteps?: Product['deliverySteps'];
  terms?: Product['terms'];
  importantNotes?: Product['importantNotes'];
}

const ListDot = () => <div className='w-1 h-1 rounded-full bg-[#23c299]' />;
const StepNumber = ({ n }: { n: number }) => (
  <div className='w-5 h-5 rounded-full bg-[#4618AC]/10 text-[#4618AC] flex items-center justify-center text-xs font-medium'>
    {n}
  </div>
);

const InfoTabs: React.FC<InfoTabsProps> = ({
  description,
  keyFeatures = siteSettings.defaultProduct.keyFeatures,
  deliveryInfo = siteSettings.defaultProduct.deliveryInfo,
  deliverySteps = siteSettings.defaultProduct.deliverySteps,
  terms = siteSettings.defaultProduct.terms,
  importantNotes = siteSettings.defaultProduct.importantNotes,
}) => {
  return (
    <div className='bg-white'>
      <Tabs defaultValue='description' className='w-full p-6 pt-2 px-2'>
        <TabsList className='w-full flex'>
          <TabsTrigger
            value='description'
            className='px-8 py-3 text-sm shadow-none font-medium text-gray-500 -mb-[2px] rounded-none border-transparent data-[state=active]:border-[#4618AC] data-[state=active]:text-[#4618AC] transition-colors'
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value='delivery'
            className='px-8 py-3 text-sm font-medium text-gray-500 -mb-[2px] rounded-none border-transparent data-[state=active]:border-[#4618AC] data-[state=active]:text-[#4618AC] transition-colors'
          >
            Delivery Info
          </TabsTrigger>
          <TabsTrigger
            value='terms'
            className='px-8 py-3 text-sm font-medium text-gray-500 -mb-[2px] rounded-none border-transparent data-[state=active]:border-[#4618AC] data-[state=active]:text-[#4618AC] transition-colors'
          >
            Terms
          </TabsTrigger>
        </TabsList>

        {/* Description */}
        <TabsContent value='description' className='p-6'>
          <div className='space-y-4'>
            <p className='text-gray-600 leading-relaxed'>{description}</p>
            {keyFeatures.length > 0 && (
              <div className='space-y-2'>
                <h4 className='font-medium text-[#212121]'>Key Features</h4>
                <ul className='grid gap-2 text-sm text-gray-600'>
                  {keyFeatures.map((feature, idx) => (
                    <li key={idx} className='flex items-center gap-2'>
                      <ListDot />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Delivery */}
        <TabsContent value='delivery' className='p-6'>
          <div className='space-y-4'>
            <p className='text-gray-600 leading-relaxed'>{deliveryInfo}</p>
            {deliverySteps.length > 0 && (
              <div className='space-y-2'>
                <h4 className='font-medium text-[#212121]'>Delivery Process</h4>
                <div className='grid gap-2 text-sm text-gray-600'>
                  {deliverySteps.map((step, idx) => (
                    <div key={idx} className='flex items-center gap-2'>
                      <StepNumber n={idx + 1} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Terms */}
        <TabsContent value='terms' className='p-6'>
          <div className='space-y-4'>
            <p className='text-gray-600 leading-relaxed'>{terms}</p>
            {importantNotes.length > 0 && (
              <div className='space-y-2'>
                <h4 className='font-medium text-[#212121]'>Important Notes</h4>
                <ul className='grid gap-2 text-sm text-gray-600'>
                  {importantNotes.map((note, idx) => (
                    <li key={idx} className='flex items-center gap-2'>
                      <ListDot />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfoTabs;

'use client';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveBonusBlast from '@/components/live-bonus-blast';
import BonusBlast from '@/components/bonus-blast';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { PAGE_TIMER_SEC_LIVE, PAGE_TIMER_SEC_PAST } from '@/config';
import {
  useGetSettingByName,
  useGetSettings,
} from '@/hooks/settings/useSettings';

export default function Home() {
  const [timer, setTimer] = React.useState(0);
  const { data: settings } = useGetSettings();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState(
    searchParams.get('view') || 'past'
  );

  const LIVE_TIMER = settings?.find(
    (setting) => setting.name === 'PAGE_TIMER_SEC_LIVE'
  )?.value as number;

  const PAST_TIMER = settings?.find(
    (setting) => setting.name === 'PAGE_TIMER_SEC_PAST'
  )?.value as number;

  React.useEffect(() => {
    window.history.replaceState(null, '', `/?view=${activeTab}`);
    // reset timer
    setTimer(0);
  }, [activeTab]);

  // an effect to change the active base on an interval
  React.useEffect(() => {
    const secondsInterval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === 'live' ? 'past' : 'live'));
      console.log('changing tab');
    }, 1000 * (activeTab === 'live' ? LIVE_TIMER : PAST_TIMER));

    return () => {
      clearInterval(secondsInterval);
      clearInterval(interval);
    };
  }, [activeTab]);

  return (
    <div className='p-4 h-full'>
      <div className='h-3 bg-accent/30 backdrop-blur-lg fixed top-0 left-0 right-0'>
        <div
          className='h-full bg-white/70 transition-all duration-1000'
          style={{
            width: `${
              (timer / (activeTab === 'live' ? LIVE_TIMER : PAST_TIMER)) * 100
            }%`,
          }}
        ></div>
        <span className='text-right w-full block text-xs'></span>
      </div>
      {/* {timer} */}
      <Tabs
        defaultValue={activeTab}
        className='flex flex-col h-full'
        onValueChange={(value) => setActiveTab(value)}
        value={activeTab}
      >
        <TabsList className='mx-auto'>
          <TabsTrigger value='past' className='relative'>
            Past
            <Image
              src='/star.png'
              width={20}
              height={20}
              alt='rocket'
              className='absolute top-0 -left-2 transform translate-x-1/2 -translate-y-1/2 transition-transform duration-300'
            />
          </TabsTrigger>
          <TabsTrigger value='live'>
            Live
            <span className='bg-primary rounded-full size-2 ml-2 animate-pulse'></span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='live'>
          <LiveBonusBlast />
        </TabsContent>
        <TabsContent value='past'>
          <BonusBlast />
        </TabsContent>
      </Tabs>
    </div>
  );
}

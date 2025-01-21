'use client';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveBonusBlast from '@/components/live-bonus-blast';
import BonusBlast from '@/components/bonus-blast';
import Image from 'next/image';

export default function Home() {
  return (
    <div className=''>
      <Tabs defaultValue='past' className='flex flex-col'>
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

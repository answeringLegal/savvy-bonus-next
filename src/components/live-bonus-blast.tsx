import React from 'react';
import { motion } from 'framer-motion';
import { formatMoney } from '@/lib/utils';
import { endOfQuarter, format, startOfQuarter } from 'date-fns';
import { useFetchLiveQualifyingDeals } from '@/hooks/useHubspot';
import { Marquee } from './marquee';
import ordinal from 'ordinal';
import { SalesmanPodium } from './salesman-podium';
import QuarterIntervalDuration from './quarter-interval';
import { SalemanCard } from './salesman-card';
import { Loader } from '@/components/ui/loader';
const ACCOUNT_VALUE = 100;
const quarterStart = format(startOfQuarter(new Date()), 'yyyy-MM-dd');
const quarterEnd = format(endOfQuarter(new Date()), 'yyyy-MM-dd');
export default function LiveBonusBlast() {
  const { data, isLoading } = useFetchLiveQualifyingDeals({
    startDate: quarterStart,
    endDate: quarterEnd,
  });
  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );
  if (!data) return <div>No data</div>;

  const orderedSalesmen = Object.entries(data)
    .map(([owner, deals]) => {
      return {
        owner,
        deals,
      };
    })
    .sort((a, b) => b?.deals?.length - a?.deals?.length);

  const salesmenPodium = [
    { ...orderedSalesmen[1], place: 2 },
    { ...orderedSalesmen[0], place: 1 },
    { ...orderedSalesmen[2], place: 3 },
  ];

  const total_paid_accounts = Object.values(data).reduce(
    (acc, deals) => acc + deals?.length || 0,
    0
  );
  return (
    <div>
      <Marquee>
        {orderedSalesmen.map((salesman, index) => {
          return (
            <div key={index} className='flex items-center mx-4 gap-2'>
              <div>{ordinal(index + 1)}</div>
              <div>{salesman.owner}</div>
            </div>
          );
        })}
      </Marquee>
      <header className='flex flex-col justify-center items-center'>
        <div className='flex justify-center items-end space-x-10 w-full my-10 relative'>
          {salesmenPodium.map((salesman) => {
            if (salesman.owner)
              return (
                <SalesmanPodium key={salesman.place} salesman={salesman} />
              );
          })}
        </div>
        <QuarterIntervalDuration />
      </header>
      {/* All Sales */}
      <div className='grid grid-cols-6 gap-4'>
        <motion.div
          className='col-span-4 space-y-4'
          initial='hidden'
          animate='visible'
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                bounce: 0,
                duration: 0.7,
                delayChildren: 0.3,
                staggerChildren: 0.05,
              },
            },
            hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
          }}
        >
          {orderedSalesmen.map((salesman, index) => {
            return (
              <SalemanCard
                key={index}
                salesman={{
                  name: salesman.owner,
                  avatar: `https://randomuser.me/api/portraits/men/${
                    index + 1
                  }.jpg`,
                  prize: salesman?.deals?.length * ACCOUNT_VALUE,
                  sales: salesman?.deals?.length,
                }}
                place={index + 1}
              />
            );
          })}
        </motion.div>
        <div className='col-span-2 space-y-4'>
          <div className='bg-card p-4 rounded-md shadow-lg flex flex-col gap-4 items-center'>
            <span className='font-light text-lg uppercase'>Bonus Pool</span>
            <h2 className='text-6xl font-extrabold text-primary flex items-center gap-4'>
              {formatMoney(ACCOUNT_VALUE * total_paid_accounts)}
            </h2>
            <span className='font-light text-lg uppercase text-foreground/70'>
              {total_paid_accounts} Paid Accounts
            </span>
          </div>
          <div className='text-center'>
            <h3
              className='font-extrabold text-foreground text-4xl uppercase drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]
'
            >
              Bonus Blast
            </h3>
            <h3 className='font-extrabold text-foreground text-4xl uppercase'>
              {format(new Date(), 'QQQ y')}
            </h3>
          </div>
          <div className='flex gap-2 flex-col items-center'>
            <p>
              {format(startOfQuarter(new Date()), 'MMM dd')} -{' '}
              {format(endOfQuarter(new Date()), 'MMM dd')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

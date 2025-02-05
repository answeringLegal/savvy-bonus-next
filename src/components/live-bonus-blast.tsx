import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatMoney } from '@/lib/utils';
import { endOfQuarter, format, startOfQuarter } from 'date-fns';
import {
  useFetchLiveQualifyingDeals,
  useFetchTodayDeals,
} from '@/hooks/useHubspot';
import { Marquee } from './marquee';
import QuarterIntervalDuration from './quarter-interval';
import { SalesmanCard } from './salesman-card';
import { Loader } from '@/components/ui/loader';
import { ACCOUNT_VALUE, MAX_PARTICIPANTS } from '@/config';
import { SalesProgressCard } from './salesman-card-progress';
import WebhookListener from './salesman-webhook-listener';
import { FlowBiteModal } from './ui/flowbite-modal';
import MoneyPit, { MoneyPitHandle } from './money-pit';
import { config } from '@/site/config';
import json from '../../public/data.json';

const quarterStart = format(startOfQuarter(new Date()), 'yyyy-MM-dd');
const quarterEnd = format(endOfQuarter(new Date()), 'yyyy-MM-dd');

export default function LiveBonusBlast() {
  const [salesmenView, setSalesmenView] = useState<'qualified' | 'all'>(
    'qualified'
  );
  const { data, isLoading } = useFetchLiveQualifyingDeals({
    startDate: quarterStart,
    endDate: quarterEnd,
  });

  const { data: dealsToday, isLoading: loadingDealsToday } =
    useFetchTodayDeals();

  const moneyPitRef = useRef<MoneyPitHandle>(null);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const newAccounts = Math.floor(Math.random() * 5);
  //     moneyPitRef.current?.addElements(newAccounts);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  // an effect to change salesmenView to all after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSalesmenView((prev) => (prev === 'qualified' ? 'all' : 'qualified'));
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [salesmenView]);

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  if (!data || !dealsToday) return <div>No data</div>;

  const dt = Object.entries(dealsToday).map(([owner, deals]) => {
    return {
      owner,
      deals,
    };
  });
  const orderedSalesmen = Object.entries(data)
    .map(([owner, deals]) => {
      return {
        owner,
        deals,
        todaySales: dealsToday[owner],
      };
    })
    .slice(0, MAX_PARTICIPANTS)
    .sort((a, b) => b?.deals?.length - a?.deals?.length);

  const total_paid_accounts = Object.values(data).reduce(
    (acc, deals) => acc + deals?.length || 0,
    0
  );
  return (
    <>
      {json && json.length && <pre>{json?.length}</pre>}
      <WebhookListener
        onNewDeal={(deal) => {
          moneyPitRef.current?.addElements(2);
        }}
      />
      {/* <FlowBiteModal /> */}
      <div className='flex flex-col h-full live-event'>
        <div
          className='
        bg-gradient-to-b
        from-green-500/40
        to-transparent
        w-full
        h-[200px]
        left-0
        top-0
        absolute
        z-[-1] animate-fade-in'
        ></div>
        {dt.length > 0 && (
          <Marquee>
            <span className='spacer mx-20'>🎉</span>
            <span>Sales Today: </span>
            {dt?.map((deal, index) => {
              return (
                <div key={index} className='flex items-center mx-4 gap-2'>
                  <div>{deal.owner}</div>
                  <div>{deal.deals.length}</div>
                </div>
              );
            })}
            <span className='spacer mx-20'>🎉</span>
          </Marquee>
        )}
        <header className='my-16 sm:my-8'>
          <QuarterIntervalDuration />
        </header>
        {/* All Sales */}
        <div
          className='grid grid-cols-6 gap-4'
          style={{
            flex: 1,
          }}
        >
          <motion.div
            className='col-span-4 space-y-4 overflow-y-auto no-scrollbar flex flex-col'
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
                  delay: 0.5,
                },
              },
              hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
            }}
          >
            <AnimatePresence>
              {orderedSalesmen.map((salesman, index) => {
                if (salesmenView === 'qualified')
                  return (
                    <SalesmanCard
                      className='flex-1'
                      key={index}
                      salesman={{
                        name: salesman.owner,
                        avatar: `https://randomuser.me/api/portraits/men/${
                          index + 1
                        }.jpg`,
                        prize: total_paid_accounts * ACCOUNT_VALUE,
                        sales: salesman?.deals?.length,
                        salesToday: salesman.todaySales?.length,
                      }}
                      place={index + 1}
                    />
                  );
                if (salesmenView === 'all')
                  return (
                    <SalesProgressCard
                      className='flex-1'
                      key={index}
                      salesman={{
                        name: salesman.owner,
                        avatar: `https://randomuser.me/api/portraits/men/${
                          index + 1
                        }.jpg`,

                        sales: salesman?.deals?.length,
                      }}
                      deals={{
                        pending: salesman?.deals?.length,
                        completed: Math.round(
                          orderedSalesmen.length / (index + 1)
                        ), //TODO: change this to actual value from chargeover api
                      }}
                      place={index + 1}
                    />
                  );
              })}
            </AnimatePresence>
          </motion.div>
          <div className='col-span-2 space-y-4 relative flex flex-col'>
            <div className='text-center'>
              <h3
                className='font-extrabold text-foreground text-4xl uppercase drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]
'
                style={{ textShadow: '2px 5.2px 1.2px hsl(var(--accent))' }}
              >
                {config.name}
              </h3>
              <h3
                className='font-extrabold text-foreground text-4xl uppercase'
                style={{ textShadow: '2px 5.2px 1.2px hsl(var(--accent))' }}
              >
                {format(new Date(), 'QQQ y')}
              </h3>
            </div>
            <div className='flex gap-2 flex-col items-center animate-pulse'>
              <p>
                {format(startOfQuarter(new Date()), 'MMM dd')} -{' '}
                {format(endOfQuarter(new Date()), 'MMM dd')}
              </p>
            </div>
            <div className='p-4 flex flex-col gap-4 items-center'>
              <span className='font-light text-lg uppercase'>
                (Potential) Bonus Pool
              </span>
              <h2 className='text-6xl font-extrabold text-primary flex items-center gap-4'>
                {formatMoney(ACCOUNT_VALUE * total_paid_accounts)}
              </h2>
              <span className='font-light text-lg uppercase text-foreground/70'>
                {total_paid_accounts} Sales
              </span>
            </div>
            <MoneyPit
              ref={moneyPitRef}
              initialPaidAccounts={total_paid_accounts}
              elementSize={30}
            />
          </div>
        </div>
      </div>
    </>
  );
}

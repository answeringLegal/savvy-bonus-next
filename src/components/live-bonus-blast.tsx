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
import { SalesProgressCard } from './salesman-card-progress';
import WebhookListener from './salesman-webhook-listener';
import MoneyPit, { MoneyPitHandle } from './money-pit';
import { config } from '@/site/config';
import {
  useGetBonusEligibleTransactions,
  useGetTransactionsForQuarter,
} from '@/hooks/chargeover-transactions/useCOTransactions';
import {
  getLeaderboardForChargeOverTransactions,
  getLeaderboardForHubspotDeals,
} from '@/lib/bonus-blast/chargeOverLeaderboard';
import { getUsersByName, useGetAllUsers } from '@/hooks/users/useUsers';
import { useGetSettings } from '@/hooks/settings/useSettings';

const quarterStart = format(startOfQuarter(new Date()), 'yyyy-MM-dd');
const quarterEnd = format(endOfQuarter(new Date()), 'yyyy-MM-dd');

const transactionKey = `${format(new Date(), 'QQQ_yyyy')}`;

export default function LiveBonusBlast() {
  const { data: settings } = useGetSettings();
  const [salesmenView, setSalesmenView] = useState<'qualified' | 'all'>(
    'qualified'
  );
  const { data: transactions, isLoading: isTransactionsLoading } =
    useGetBonusEligibleTransactions(transactionKey);
  const { data: tTQ, isLoading: isTTQLoading } =
    useGetTransactionsForQuarter(transactionKey);

  const { data: liveQualifyingDeals, isLoading: isLiveQualifyingDealsLoading } =
    useFetchLiveQualifyingDeals({
      startDate: quarterStart,
      endDate: quarterEnd,
    });

  const { data: users } = useGetAllUsers();

  const { data: dealsToday, isLoading: isDealsTodayLoading } =
    useFetchTodayDeals();

  const MAX_PARTICIPANTS = settings?.find(
    (setting) => setting.name === 'MAX_PARTICIPANTS'
  );
  const ACCOUNT_VALUE = settings?.find(
    (setting) => setting.name === 'ACCOUNT_VALUE'
  );

  const moneyPitRef = useRef<MoneyPitHandle>(null);

  // an effect to change salesmenView to all after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSalesmenView((prev) => (prev === 'qualified' ? 'all' : 'qualified'));
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [salesmenView]);

  if (
    isTransactionsLoading ||
    isDealsTodayLoading ||
    isLiveQualifyingDealsLoading
  )
    return (
      <div>
        <Loader />
      </div>
    );

  if (!liveQualifyingDeals || !dealsToday || !transactions || !tTQ)
    return <div>No data</div>;

  const {
    orderedSalesmen: transactionOrderedSalesmen,
    totalPaidAccounts: transactionsTotalPaidAccounts,
    groupedBySalesman: transactionsGroupedBySalesman,
  } = getLeaderboardForChargeOverTransactions(
    transactions,
    Number(MAX_PARTICIPANTS?.value)
  );

  // const {
  //   orderedSalesmen: dealsOrderedSalesmen,
  //   totalPaidAccounts: dealsTotalAccounts,
  // } = getLeaderboardForHubspotDeals(liveQualifyingDeals);

  const {
    orderedSalesmen: tTQOrderedSalemen,
    totalPaidAccounts: tTQTotalPaidAccounts,
    groupedBySalesman: tTQGroupedBySalesman,
  } = getLeaderboardForChargeOverTransactions(tTQ);

  const { orderedSalesmen: dealsTodayOrderedSalesmen } =
    getLeaderboardForHubspotDeals(dealsToday, Number(MAX_PARTICIPANTS?.value));

  return (
    <>
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

        {dealsTodayOrderedSalesmen.length > 0 && (
          <Marquee>
            <span className='spacer mx-20'>🎉</span>
            <span>Sales Today: </span>
            {dealsTodayOrderedSalesmen?.map((deal, index) => {
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
              {tTQOrderedSalemen.map((salesman, index) => {
                if (salesmenView === 'qualified')
                  return (
                    <SalesmanCard
                      className=''
                      key={index}
                      salesman={{
                        name:
                          getUsersByName(salesman.owner, users ?? [])?.hubspot
                            .name ?? 'Unknown Salesman',
                        avatar: `https://randomuser.me/api/portraits/men/${
                          index + 1
                        }.jpg`,
                        prize:
                          tTQTotalPaidAccounts * Number(ACCOUNT_VALUE?.value),
                        sales: salesman?.deals?.length,
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
                        name: getUsersByName(salesman.owner, users ?? [])
                          ?.hubspot.name,
                        avatar: `https://randomuser.me/api/portraits/men/${
                          index + 1
                        }.jpg`,

                        sales: salesman?.deals?.length,
                      }}
                      deals={{
                        pending: salesman?.deals?.length,
                        completed:
                          (transactionsGroupedBySalesman &&
                            transactionsGroupedBySalesman[
                              getUsersByName(salesman.owner, users ?? [])
                                ?.chargeover.name
                            ]?.length) ||
                          0,
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
                {format(new Date(), 'QQQ')}
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
                {formatMoney(
                  Number(ACCOUNT_VALUE?.value) * tTQTotalPaidAccounts
                )}
              </h2>
              <span className='font-light text-lg uppercase text-foreground/70'>
                {tTQTotalPaidAccounts} Sales
              </span>
            </div>
            <MoneyPit
              ref={moneyPitRef}
              initialPaidAccounts={tTQTotalPaidAccounts}
              elementSize={30}
            />
          </div>
        </div>
      </div>
    </>
  );
}

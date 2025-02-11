import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatMoney } from '@/lib/utils';
import {
  addDays,
  endOfQuarter,
  format,
  formatDistance,
  startOfQuarter,
  subDays,
  subQuarters,
} from 'date-fns';
import { useFetchQualifyingDeals } from '@/hooks/useHubspot';
import { SalesmanPodium } from './salesman-podium';
import QuarterIntervalDuration from './quarter-interval';
import { SalesmanCard } from './salesman-card';
import { Loader } from '@/components/ui/loader';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Image from 'next/image';
import { NativeDialog } from './ui/native-dialog';
import { getSalesmanBonus } from '@/hooks/utils/bonus';
import { Button } from './ui/button';
import { DownloadCloud } from 'lucide-react';
import { config } from '../site/config';
import { useGetBonusEligibleTransactions } from '@/hooks/chargeover-transactions/useCOTransactions';
import { TransactionData } from '@/types/transactions';
import { getLeaderboardForChargeOverTransactions } from '@/lib/bonus-blast/chargeOverLeaderboard';
import { useGetSetting, useGetSettings } from '@/hooks/settings/useSettings';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
// const quarterStart = format(
//   startOfQuarter(subQuarters(new Date(), 1)),
//   'yyyy-MM-dd'
// );
// const quarterEnd = format(
//   endOfQuarter(subQuarters(new Date(), 1)),
//   'yyyy-MM-dd'
// );
const transactionKey = `${format(
  startOfQuarter(subQuarters(new Date(), 1)),
  'QQQ_yyyy'
)}`;

export default function BonusBlast() {
  // const {} = useKindeBrowserClient;
  const { data: settings } = useGetSettings();
  const { data: transactions, isLoading: isTransactionsLoading } =
    useGetBonusEligibleTransactions(transactionKey);
  // const { data, isLoading } = useFetchQualifyingDeals({
  //   startDate: quarterStart,
  //   endDate: quarterEnd,
  // });

  if (isTransactionsLoading)
    return (
      <div>
        <Loader />
      </div>
    );
  // if (!data)
  //   return (
  //     <div>
  //       <h1>Hubspot is being a bitch</h1>
  //     </div>
  //   );
  if (!transactions) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  const MAX_PARTICIPANTS = settings?.find(
    (setting) => setting.name === 'MAX_PARTICIPANTS'
  );
  const ACCOUNT_VALUE = settings?.find(
    (setting) => setting.name === 'ACCOUNT_VALUE'
  );
  const { orderedSalesmen, podium, totalPaidAccounts, downloadCSV } =
    getLeaderboardForChargeOverTransactions(
      transactions,
      Number(MAX_PARTICIPANTS?.value)
    );

  // the game ends 30 days after the previous quarter
  const isGameEnded =
    new Date() > addDays(endOfQuarter(subQuarters(new Date(), 1)), 30);

  return (
    <div className='flex flex-col h-full'>
      <div
        className='
        bg-gradient-to-b
        from-blue-500/40
        to-transparent
        w-full
        h-[200px]
        left-0
        top-0
        absolute
        z-[-1] animate-fade-in'
      ></div>

      {isGameEnded && (
        <motion.div
          className='winner-announcement absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-xl z-50'
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, display: 'none' }}
          transition={{ duration: 0.5, delay: 6 }}
        >
          <DotLottieReact
            className='absolute top-0 left-0 w-full h-full -z-[1]'
            style={{
              objectFit: 'cover',
              height: '100dvh',
              width: '100dvw',
            }}
            src='https://lottie.host/f7e6efe7-8a03-4627-9c33-0fb6e10f0fe2/OEzLw7vXwg.lottie'
            loop
            autoplay
          />
          <motion.div>
            <motion.div
              // fade away after 5 seconds
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0.2, y: -40 }}
              transition={{ duration: 0.5, delay: 3 }}
            >
              <DotLottieReact
                src='https://lottie.host/9d5da2d1-ee84-43e9-86b2-625bc13dc80b/9LQgVAlIgk.lottie'
                autoplay
              />
            </motion.div>

            <motion.div
              className=''
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: -300 }}
              transition={{ duration: 0.5, delay: 3 }}
            >
              <h1 className='text-6xl font-extrabold text-primary text-center'>
                {/* {salesmenPodium[1].owner} */}
                {podium[1].owner}
              </h1>
              <h2 className='text-2xl font-extrabold text-primary text-center'>
                Wins the {config.name} For{' '}
                {format(subQuarters(new Date(), 1), 'QQQ y')}
              </h2>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      <div
        className={cn('text-center absolute top-4 right-4 z-50', {
          hidden: isGameEnded,
        })}
      >
        <p className='text-sm text-foreground/50'>Final Results Pending</p>
        {/* <h2 className='text-foreground/80 font-bold text-2xl'>
          {formatDistance(
            addDays(endOfQuarter(subQuarters(new Date(), 1)), 30),
            new Date(),
            {
              addSuffix: true,
            }
          )}
        </h2> */}
        <QuarterIntervalDuration
          startDate={new Date()}
          endDate={addDays(endOfQuarter(subQuarters(new Date(), 1)), 30)}
        />
      </div>
      <header className='my-16 sm:my-32'>
        <motion.div
          className='flex justify-center items-end -space-x-2 my-10 relative max-w-3xl mx-auto'
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
                staggerChildren: 0.15,
              },
            },
            hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
          }}
        >
          {podium.map((salesman) => {
            if (salesman.owner)
              return (
                <SalesmanPodium
                  variants={{
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                      },
                    },
                    hidden: {
                      opacity: 0,
                      y: 20,
                      transition: { duration: 0.2 },
                    },
                  }}
                  key={salesman.place}
                  salesman={salesman}
                  bonus={getSalesmanBonus(
                    // total_paid_accounts * ACCOUNT_VALUE,
                    totalPaidAccounts * Number(ACCOUNT_VALUE?.value),
                    salesman.place
                  )}
                />
              );
          })}
        </motion.div>
      </header>

      {/* All Sales */}

      <div
        className='grid grid-cols-6 gap-4'
        style={{
          flex: 1,
        }}
      >
        {/* <Button
          title='Download Full Results as CSV'
          size={'icon'}
          className='fixed right-4 bottom-16 z-50'
          onClick={downloadResultsAsCSV}
        >
          <DownloadCloud className='size-4' />
        </Button> */}
        <Button
          title='Download Full Results as CSV'
          size={'icon'}
          className='fixed right-4 bottom-16 z-50'
          onClick={downloadCSV}
        >
          <DownloadCloud className='size-4' />
        </Button>
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
          {orderedSalesmen?.slice(3)?.map((transaction, index) => {
            return (
              <SalesmanCard
                className='flex-1'
                key={index}
                salesman={{
                  name: transaction.owner,
                  avatar: `https://randomuser.me/api/portraits`,
                  prize: totalPaidAccounts * Number(ACCOUNT_VALUE?.value),
                  sales: transaction?.deals?.length,
                }}
                place={index + 4}
              />
            );
          })}
        </motion.div>
        <div className='col-span-2 space-y-4'>
          <div className='bg-card p-4 rounded-md shadow-lg flex flex-col gap-4 items-center'>
            <span className='font-light text-lg uppercase'>Bonus Pool</span>
            <h2 className='text-6xl font-extrabold text-primary flex items-center gap-4'>
              {/* {formatMoney(ACCOUNT_VALUE * total_paid_accounts)} */}
              {formatMoney(Number(ACCOUNT_VALUE?.value) * totalPaidAccounts)}
            </h2>
            <span className='font-light text-lg uppercase text-foreground/70'>
              {/* {total_paid_accounts} Paid Accounts */}
              {totalPaidAccounts} Paid Accounts
            </span>
          </div>
          <div className='text-center'>
            <h3
              className='font-extrabold text-foreground text-4xl uppercase drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]
'
            >
              Quarterly Jackpot
            </h3>
            <h3 className='font-extrabold text-foreground text-4xl uppercase'>
              {format(subQuarters(new Date(), 1), 'QQQ y')}
            </h3>
          </div>
          <div className='flex gap-2 flex-col items-center'>
            <p>
              {format(startOfQuarter(subQuarters(new Date(), 1)), 'MMM dd')} -{' '}
              {format(endOfQuarter(subQuarters(new Date(), 1)), 'MMM dd')}
            </p>
          </div>
        </div>
      </div>
      {isGameEnded && (
        <DotLottieReact
          className='absolute top-0 left-0 w-full h-full -z-[1]'
          style={{
            objectFit: 'cover',
            height: '100dvh',
            width: '100dvw',
          }}
          src='https://lottie.host/f7e6efe7-8a03-4627-9c33-0fb6e10f0fe2/OEzLw7vXwg.lottie'
          loop
          autoplay
        />
      )}
    </div>
  );
}

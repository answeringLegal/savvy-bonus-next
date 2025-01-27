import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMoney } from '@/lib/utils';
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
import { ACCOUNT_VALUE, MAX_PARTICIPANTS } from '@/config';
import { getSalemanBonus } from '@/hooks/utils/bonus';

const quarterStart = format(
  startOfQuarter(subQuarters(new Date(), 1)),
  'yyyy-MM-dd'
);
const quarterEnd = format(
  endOfQuarter(subQuarters(new Date(), 1)),
  'yyyy-MM-dd'
);
export default function BonusBlast() {
  const { data, isLoading } = useFetchQualifyingDeals({
    startDate: quarterStart,
    endDate: quarterEnd,
  });

  // effect to close the dialog after 10 seconds if it's still open

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );
  if (!data)
    return (
      <div>
        <h1>Hubspot is being a bitch</h1>
      </div>
    );
  // order top 8 salesmen
  const orderedSalesmen = Object.entries(data)
    .map(([owner, deals]) => {
      return {
        owner,
        deals,
      };
    })
    .slice(0, MAX_PARTICIPANTS)
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
      {/* <DotLottieReact
        className='absolute top-0 left-0 w-full h-full'
        src='https://lottie.host/f7e6efe7-8a03-4627-9c33-0fb6e10f0fe2/OEzLw7vXwg.lottie'
        loop
        autoplay
      />
      <motion.div>
        <DotLottieReact
          src='https://lottie.host/9d5da2d1-ee84-43e9-86b2-625bc13dc80b/9LQgVAlIgk.lottie'
          autoplay
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <h1 className='text-6xl font-extrabold text-primary text-center'>
            {salesmenPodium[1].owner}
          </h1>
          <h2 className='text-2xl font-extrabold text-primary text-center'>
            Wins the Bonus Blast For{' '}
            {format(subQuarters(new Date(), 1), 'QQQ y')}
          </h2>
        </motion.div>
      </motion.div> */}
      <div className='text-center absolute top-4 right-4 z-50'>
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
          {salesmenPodium.map((salesman) => {
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
                  bonus={getSalemanBonus(
                    total_paid_accounts * ACCOUNT_VALUE,
                    salesman.place
                  )}
                />
              );
          })}
        </motion.div>
      </header>

      {/* <AnimatePresence>
        <motion.div
          initial={{ scale: 1, x: 0, y: 0 }}
          animate={{
            scale: 0.5,
            x: '40vw',
            y: '-40vh',
            transition: { duration: 0.5, ease: 'easeInOut', delay: 2.5 },
          }}
          className='text-center my-8 p-2 rounded-r-lg bg-primary/20 border border-primary/10 shadow-lg max-w-md mx-auto fixed inset-0 z-50 pointer-events-none'
        >
          <Image
            src='/clock2.png'
            width={125}
            height={125}
            quality={100}
            alt='rocket'
            className='absolute top-12 left-6 transform -translate-x-1/2 -translate-y-1/2 '
          />
          <div className='absolute top-6 left-6 transform -translate-x-1/2 -translate-y-1/2 blur-3xl -z-10 bg-primary h-20 w-20 rounded-full' />
          <p className='text-sm text-foreground/50'>Final Results</p>
          <h2 className='text-foreground/80 font-bold text-2xl'>
            {formatDistance(
              addDays(endOfQuarter(subQuarters(new Date(), 1)), 30),
              new Date(),
              {
                addSuffix: true,
              }
            )}
          </h2>
          <QuarterIntervalDuration
            startDate={new Date()}
            endDate={addDays(endOfQuarter(subQuarters(new Date(), 1)), 30)}
          />
          <motion.div className='w-full h-8 bg-background rounded-full overflow-hidden'>
            <motion.div
              className='h-full bg-primary'
              initial='hidden'
              animate='visible'
              variants={{
                visible: {
                  width: '80%',
                  transition: { duration: 1.5 },
                },
                hidden: { width: 0 },
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence> */}

      {/* <motion.div className='text-center my-8 p-2 rounded-r-lg max-w-md mx-auto relative bg-card'>
        <Image
          src='/clock2.png'
          width={125}
          height={125}
          quality={100}
          alt='rocket'
          className='absolute top-12 left-6 transform -translate-x-1/2 -translate-y-1/2 '
        />
        <div className='absolute top-6 left-6 transform -translate-x-1/2 -translate-y-1/2 blur-3xl -z-10 bg-primary h-20 w-20 rounded-full' />

        <QuarterIntervalDuration
          startDate={new Date()}
          endDate={addDays(endOfQuarter(subQuarters(new Date(), 1)), 30)}
        />
        <motion.div className='w-full h-8 bg-background rounded-full overflow-hidden'>
          <motion.div
            className='h-full bg-primary'
            initial='hidden'
            animate='visible'
            variants={{
              visible: {
                width: '80%',
                transition: { duration: 1.5 },
              },
              hidden: { width: 0 },
            }}
          ></motion.div>
        </motion.div>
      </motion.div> */}
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
          {orderedSalesmen.slice(3).map((salesman, index) => {
            return (
              <SalesmanCard
                className='flex-1'
                key={index}
                salesman={{
                  name: salesman.owner,
                  avatar: `https://randomuser.me/api/portraits/men/${index}.jpg`,
                  prize: total_paid_accounts * ACCOUNT_VALUE,
                  sales: salesman?.deals?.length,
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
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import ordinal from 'ordinal';
import { AnimatedCard } from './animated-card';

interface SalesProgressCardProps
  extends React.ComponentProps<typeof motion.div> {
  place: number;
  salesman: { name: string; avatar: string; sales: number };
  deals: {
    completed: number;
    pending: number;
  };
}
export const SalesProgressCard = ({
  className,
  salesman,
  deals,
  ...props
}: SalesProgressCardProps) => {
  const total = deals.completed + deals.pending;
  const completed = (deals.completed / total) * 100;
  const pending = (deals.pending / total) * 100;
  return (
    <AnimatedCard>
      <div className='place text-3xl'>{ordinal(props.place)}</div>
      {/* <img src={salesman.avatar} alt={salesman.name} className='avatar' /> */}
      <Avatar className='w-16 h-16'>
        <AvatarImage src={`/salesmen/${salesman.name}.png`} />
        <AvatarFallback>
          {salesman.name
            .split(' ')
            .map((name) => name[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div className='flex flex-col w-full relative'>
        <h2 className='name font-bold absolute -top-7 left-0 z-10'>
          {salesman.name}
        </h2>
        <DealProgress>
          <DealProgressBar
            progress={completed}
            label={`${deals.completed} Bonus`}
            className='bg-primary'
          />
          <DealProgressBar
            progress={pending}
            label={`${deals.pending} Sales`}
            className='bg-blue-500/30 progress-striped progress-animated'
            labelClassName='text-foreground'
          />
        </DealProgress>
      </div>
    </AnimatedCard>
  );
};

interface DealProgressProps extends React.ComponentProps<'div'> {}

interface DealProgressBarProps extends React.ComponentProps<'div'> {
  progress: number;
  label?: string;
  labelClassName?: string;
}

const DealProgressBar = ({
  className,
  progress,
  label,
  ...props
}: DealProgressBarProps) => {
  return (
    <div
      className={cn('h-full  transition-all duration-1000 relative', className)}
      style={{
        width: `${progress}%`,
      }}
      {...props}
    >
      {label && (
        <span
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground font-bold truncate text-sm',
            props.labelClassName,
            {
              'max-w-[1ch]': progress < 20,
            }
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

DealProgressBar.displayName = 'DealProgressBar';

const DealProgress = ({ className, ...props }: DealProgressProps) => {
  return (
    <div
      className={cn(
        'h-6 bg-background/50 backdrop-blur-lg w-full flex items-center rounded-full overflow-hidden shadow-sm',
        className
      )}
      {...props}
    />
  );
};

DealProgress.displayName = 'DealProgress';

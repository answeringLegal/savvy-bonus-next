import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import ordinal from 'ordinal';
import { formatMoney } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface SalesmanPodiumProps extends React.ComponentProps<typeof motion.div> {
  salesman: { owner: string; deals: any[]; place: number };
  bonus: number;
}

export function SalesmanPodium({
  salesman,
  bonus,
  className,
  ...props
}: SalesmanPodiumProps) {
  return (
    <motion.div
      key={salesman.place}
      className={cn(
        'relative flex flex-col items-center backdrop-blur-lg flex-1',
        className,
        {
          '-z-10': salesman.place === 3,
        }
      )}
      {...props}
    >
      <div className={cn('absolute -top-20 left-0 right-0')}>
        {/* <div className='text-foreground/70 text-xs text-center'>Bonus</div> */}
        <h3 className='text-primary font-extrabold mt-3 text-center text-3xl'>
          {formatMoney(bonus)}
        </h3>
      </div>

      <Avatar className='w-24 h-24 border'>
        <AvatarImage src={`/salesmen/${salesman.owner}.png`} />
        <AvatarFallback>
          {salesman.owner
            .split(' ')
            .map((name) => name[0])
            .join('')}
        </AvatarFallback>
      </Avatar>

      <span
        className={cn(
          'text-[15rem] absolute -top-[60px] right-10 blur-3xl select-none h-60 w-60 -z-10',
          {
            'bg-purple-600/20': salesman.place === 3,
            'bg-blue-500/20': salesman.place === 2,
            'bg-yellow-600/30': salesman.place === 1,
          }
        )}
      ></span>

      <div
        className={cn(
          'p-4 rounded-t-lg bg-gradient-to-b to-transparent w-full',
          {
            'h-24 from-yellow-600/25': salesman.place === 3,
            'h-32 from-accent/50': salesman.place === 2,
            'h-40 from-yellow-500/75': salesman.place === 1,
          }
        )}
      >
        <div className='text-3xl text-center'>{ordinal(salesman.place)}</div>
        <div className='text-foreground font-semibold mt-3 text-center text-5xl'>
          {salesman.owner.split(' ')[0]}
        </div>
        <div className='text-foreground/70 text-base text-center'>
          {salesman?.deals?.length} Deals
        </div>
      </div>
    </motion.div>
  );
}

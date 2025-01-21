import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import ordinal from 'ordinal';

interface SalesmanPodiumProps extends React.ComponentProps<typeof motion.div> {
  salesman: { owner: string; deals: any[]; place: number };
}

export function SalesmanPodium({
  salesman,
  className,
  ...props
}: SalesmanPodiumProps) {
  return (
    <motion.div
      key={salesman.place}
      className='relative w-28 flex flex-col items-center'
      {...props}
    >
      <img
        src={`https://randomuser.me/api/portraits/men/${salesman.place}.jpg`}
        alt={salesman.owner}
        className='w-16 h-16 rounded-full absolute -top-10 border-4 border-border z-10'
      />

      <span
        className={cn(
          'text-[15rem] absolute -top-[60px] right-10 blur-3xl select-none h-32 w-40',
          {
            'bg-purple-600/20': salesman.place === 3,
            'bg-blue-500/20': salesman.place === 2,
            'bg-yellow-600/30': salesman.place === 1,
          }
        )}
      ></span>

      <div
        className={cn('p-2 rounded-t-lg bg-gradient-to-b to-transparent', {
          'h-24 from-accent/25': salesman.place === 3,
          'h-32 from-accent/50': salesman.place === 2,
          'h-40 from-accent': salesman.place === 1,
        })}
      >
        <div className=''>{ordinal(salesman.place)}</div>
        <div className='text-foreground font-semibold mt-3 text-center text-[.95rem]'>
          {salesman.owner}
        </div>
        <div className='text-foreground/70 text-xs text-center'>
          {salesman?.deals?.length} Deals
        </div>
      </div>
    </motion.div>
  );
}

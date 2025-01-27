import { formatMoney } from '@/lib/utils';
import { motion } from 'framer-motion';
import ordinal from 'ordinal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getSalemanBonus } from '@/hooks/utils/bonus';
import { AnimatedCard } from './animated-card';
interface Salesman {
  name: string;
  avatar: string;
  prize: number;
  sales: number;
  salesToday?: number;
}
interface SalesmanCardProps extends React.ComponentProps<typeof motion.div> {
  salesman: Salesman;
  place: number;
}
export const SalesmanCard: React.FC<SalesmanCardProps> = ({
  salesman,
  children,
  className,
  ...props
}) => {
  const progress = {
    todayDeals: salesman.salesToday || 0 + salesman.sales,
  };
  return (
    <AnimatedCard>
      {/* {salesman.salesToday && salesman.sales > 0 && (
        <div className='info-2 sales-today flex items-center gap-4 -z-50'>
          <span className='font-bold text-primary'>Today</span>
          <div className='sales font-bold text-xl'>+{salesman.salesToday}</div>
        </div>
      )} */}
      <div className='info-1 flex items-center gap-4'>
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
        <h2 className='name font-bold text-3xl'>{salesman.name}</h2>
        <span>-</span>
        <div className='sales font-bold text-xl'>{salesman.sales}</div>
      </div>

      <div className='prize ml-auto font-extrabold text-primary text-3xl'>
        {formatMoney(getSalemanBonus(salesman.prize, props.place))}
      </div>
    </AnimatedCard>
  );
};

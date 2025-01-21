import { cn, formatMoney } from '@/lib/utils';
import { motion } from 'framer-motion';
import ordinal from 'ordinal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
interface Salesman {
  name: string;
  avatar: string;
  prize: number;
  sales: number;
}
interface SalesmanCardProps extends React.ComponentProps<typeof motion.div> {
  salesman: Salesman;
  place: number;
}
export const SalemanCard: React.FC<SalesmanCardProps> = ({
  salesman,
  children,
  className,
  ...props
}) => {
  return (
    <motion.div
      {...props}
      variants={{
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 24 },
        },
        hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
      }}
      className={cn(
        'p-4 flex items-center gap-4 bg-card rounded-md shadow-lg',
        className
      )}
    >
      <div className='info flex items-center gap-4'>
        <div className='place text-3xl'>{ordinal(props.place)}</div>
        {/* <img src={salesman.avatar} alt={salesman.name} className='avatar' /> */}
        <Avatar>
          <AvatarImage src={salesman.avatar} />
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
    </motion.div>
  );
};

function getSalemanBonus(totalPool: number, place: number) {
  switch (place) {
    case 1:
      return totalPool * 0.3;
    case 2:
      return totalPool * 0.2;
    case 3:
      return totalPool * 0.15;
    case 4:
      return totalPool * 0.1;
    case 5:
      return totalPool * 0.08;
    case 6:
      return totalPool * 0.07;
    case 7:
      return totalPool * 0.05;
    case 8:
      return totalPool * 0.05;
    default:
      return 0;
  }
}

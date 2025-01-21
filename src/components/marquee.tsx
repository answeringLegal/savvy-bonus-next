import { cn } from '@/lib/utils';
import MarqueeComponent from 'react-fast-marquee';
interface LiveSalesMarqueeProps
  extends React.ComponentProps<typeof MarqueeComponent> {}
export function Marquee({ className, ...props }: LiveSalesMarqueeProps) {
  return (
    <MarqueeComponent
      {...props}
      className={cn(
        'flex bg-gradient-to-r from-purple-800 via-purple-600 to-blue-600 p-4 space-x-4',
        className
      )}
    />
  );
}

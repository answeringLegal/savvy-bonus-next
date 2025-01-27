import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
interface AnimatedCardProps extends React.ComponentProps<typeof motion.div> {}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
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
        'p-4 flex items-center gap-4 bg-gradient-to-b from-accent to-accent/50 rounded-md shadow-lg border flex-1',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

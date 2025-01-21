import { cn } from '@/lib/utils';
import React from 'react';

const Swipeable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const [scrolledLeft, setScrolledLeft] = React.useState(0);
  const isActionVisible = scrolledLeft > 0;
  return (
    <div className='scroll-container max-w-[100dvw]'>
      <div
        ref={ref}
        className={cn(
          'flex overflow-x-auto snap-x scroll-smooth no-scrollbar rounded-xl',
          className
        )}
        onScroll={(e) => {
          // console.log(e);
          const scrolledLeft = e.currentTarget.scrollLeft;
          setScrolledLeft(scrolledLeft);
        }}
        onClick={(e) => {
          if (isActionVisible) {
            e.stopPropagation();
            e.preventDefault();
            e.currentTarget.scrollTo({ left: 0, behavior: 'smooth' });
            setScrolledLeft(0);
          }
          props.onClick?.(e);
        }}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
        data-action-visible={isActionVisible}
        {...props}
      />
    </div>
  );
});

Swipeable.displayName = 'Swipeable';

const SwipeableItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2 p-2 w-full shrink-0 snap-start overflow-hidden',
        className
      )}
      onClick={(e) => {
        console.log(e.currentTarget.parentElement);
        const parent = e.currentTarget.parentElement;
        if (parent) {
          const isParentActionVisible =
            parent.getAttribute('data-action-visible') === 'true';
          if (isParentActionVisible) {
            e.stopPropagation();
            e.preventDefault();
            parent.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            props.onClick?.(e);
          }
        }
      }}
      {...props}
    />
  );
});

SwipeableItem.displayName = 'SwipeableItem';

const SwipeableActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex bg-accent/10 shrink-0 snap-start overflow-hidden',
      className
    )}
    {...props}
  />
));

SwipeableActions.displayName = 'SwipeableActions';

const SwipeableAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex-1 flex flex-col p-4 max-w-[6ch] items-center justify-center truncate',
        className
      )}
      {...props}
    />
  );
});

SwipeableAction.displayName = 'SwipeableAction';

export { Swipeable, SwipeableItem, SwipeableActions, SwipeableAction };

// export default function BasicSwipeable({ rightActions, className, ...props }: BasicSwipeableProps) {
//   return (
//     <div className='scroll-container max-w-[100dvw]'>
//         <div
//           className='flex overflow-x-auto snap-x scroll-smooth no-scrollbar bg-card rounded-xl'
//           style={{
//             scrollSnapType: 'x mandatory',
//             WebkitOverflowScrolling: 'touch',
//           }}
//         >
//           <div className='flex flex-col gap-2 p-2 dark:bg-accent/10 sm:w-[200px] sm:h-[200px] w-full h-[125px] shrink-0 snap-start overflow-hidden '>
//             <div className='flex flex-col p-4 items-center justify-center'>
//               <h1>Item here</h1>
//               <p>Some description</p>
//             </div>
//           </div>
//           <div className='flex dark:bg-accent/10 sm:h-[200px] min-w-[150px] h-[125px] shrink-0 snap-start overflow-hidden'>
//             <div className='bg-red-500 flex-1 flex flex-col p-4 items-center justify-center w-[6ch] truncate'>
//               <Trash2Icon size={24} />
//               Delete
//             </div>
//             <div className='bg-purple-500 flex-1 flex flex-col p-4 items-center justify-center w-[6ch] truncate'>
//               <Trash2Icon size={24} />
//               Note
//             </div>
//             <div className='bg-gray-500 flex-1 flex flex-col p-4 items-center justify-center w-[6ch] truncate'>
//               <Trash2Icon size={24} />
//               Gabilogook
//             </div>
//           </div>
//         </div>
//       </div>
//   )
// }

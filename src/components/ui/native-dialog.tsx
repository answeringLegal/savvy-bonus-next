import { cva, VariantProps } from 'class-variance-authority';
import React, { useEffect } from 'react';
import { Button } from './button';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const DialogVariants = cva(
  'native-dialog border p-4 transition-all ease-in-out',
  {
    variants: {
      variant: {
        default: '',
        small: 'w-full max-w-sm',
        medium: 'w-full max-w-md',
        large: 'w-full max-w-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  dialogTitle?: string | React.ReactNode;
}
const NativeDialog = React.forwardRef<
  HTMLDialogElement,
  React.ComponentPropsWithRef<'dialog'> &
    VariantProps<typeof DialogVariants> &
    DialogProps
>(({ open, onClose, className, variant, dialogTitle, ...props }, _ref) => {
  const ref = React.useRef<HTMLDialogElement>(null);

  const openDialog = () => {
    if (ref && ref.current) {
      ref.current.showModal();
    }
  };

  const closeDialog = () => {
    if (ref.current) {
      ref.current.close();
    }
  };

  useEffect(() => {
    if (open) {
      openDialog();
      if (ref.current) {
        ref.current.style.transform = 'translateY(0px)';
        ref.current.style.scale = '1';
        ref.current.style.opacity = '1';
      }
    } else {
      closeDialog();
      if (ref.current) {
        ref.current.style.transform = 'translateY(130px)';
        ref.current.style.scale = '0.5';
        ref.current.style.opacity = '0';
      }
    }

    return () => {
      closeDialog();
    };
  }, [open]);

  return (
    <dialog
      className={cn(DialogVariants({ variant, className }), {
        'y-0': open,
        'y-130': !open,
      })}
      onClose={onClose}
      ref={ref}
      {...props}
    >
      <header className='dialog-header flex justify-between items-center mb-4'>
        {dialogTitle && (
          <div className='dialog-title font-medium text-xl'>{dialogTitle}</div>
        )}
        <Button
          variant='outline'
          onClick={onClose}
          type='button'
          className='dialog-close z-[9999]'
        >
          <XIcon className='dialog-close-icon' />
        </Button>
      </header>
      {props.children}
    </dialog>
  );
});

NativeDialog.displayName = 'NativeDialog';

export { NativeDialog };

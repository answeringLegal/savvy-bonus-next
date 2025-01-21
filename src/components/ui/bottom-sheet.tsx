import React, { ReactNode, useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  defaultHeight?: number;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  defaultHeight = 80,
}) => {
  const [height, setHeight] = useState<number>(defaultHeight); // Initial height as a percentage of the screen
  const [initialY, setInitialY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [threshold, setThreshold] = useState(defaultHeight - 5);
  useEffect(() => {
    const updateSheetHeight = () => {
      console.log('updateSheetHeight');
      setHeight(defaultHeight);
      setThreshold(defaultHeight - 5);
    };
    updateSheetHeight();
    window.addEventListener('resize', updateSheetHeight);
    return () => window.removeEventListener('resize', updateSheetHeight);
  }, [defaultHeight]);

  useEffect(() => {
    if (isOpen) {
      setHeight(defaultHeight);
      setThreshold(defaultHeight - 5);
    }
  }, [isOpen, defaultHeight]);
  const handleDragStart = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    const clientY =
      event.type === 'touchstart'
        ? (event as React.TouchEvent<HTMLDivElement>).touches[0].clientY
        : (event as React.MouseEvent<HTMLDivElement>).clientY;

    setInitialY(clientY);
    setIsDragging(true);
  };

  const handleDrag = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (isDragging && initialY !== null) {
      const clientY =
        event.type === 'touchmove'
          ? (event as React.TouchEvent<HTMLDivElement>).touches[0].clientY
          : (event as React.MouseEvent<HTMLDivElement>).clientY;

      const offset = initialY - clientY;
      const newHeight = Math.min(
        Math.max(height + (offset / window.innerHeight) * 100, 20),
        100
      );
      setHeight(newHeight);
      setInitialY(clientY);
    }
  };

  const handleDragEnd = () => {
    console.log('handleDragEnd');
    console.log('height', height);
    console.log('threshold', threshold);

    setIsDragging(false);
    // If the height is less than the threshold, close the sheet
    if (height < threshold) {
      onClose();
    }
    // If the height is greater than the threshold + 10, set the height to 100% and the threshold to 95%
    if (height > threshold + 10) {
      setHeight(100);
      setThreshold(95);
    }
  };

  return (
    <>
      {isOpen && (
        <motion.div
          className='fixed inset-0 bg-black bg-opacity-50'
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 52 }}
        />
      )}
      <motion.div
        data-state={isOpen ? 'open' : 'closed'}
        role='dialog'
        className='bottom-sheet-dialog fixed bottom-0 left-0 right-0 bg-card p-4 rounded-t-lg shadow-lg z-50'
        style={{ height: `${height}%`, zIndex: 52 }}
        onMouseMove={isDragging ? handleDrag : undefined}
        onTouchMove={isDragging ? handleDrag : undefined}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        drag='y'
        dragConstraints={{ top: 0, bottom: 0 }} // Allow dragging only vertically
        dragElastic={0.1}
        initial={{ y: '100%' }}
        animate={isOpen ? { y: '0%' } : { y: '100%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className='h-2 w-[50px] mx-auto bg-border rounded mb-2 cursor-pointer' />
        {children}
      </motion.div>
    </>
  );
};

export default BottomSheet;

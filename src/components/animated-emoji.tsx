'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  x: number;
  y: number;
}

export default function AnimatedHearts({
  trigger,
  containerRef,
}: {
  trigger: number;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    if (trigger > 0 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newHearts: Heart[] = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * rect.width,
        y: rect.height,
      }));
      setHearts((prev) => [...prev, ...newHearts]);
    }
  }, [trigger, containerRef]);

  return (
    <AnimatePresence>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{
            opacity: 0,
            scale: 0,
            x: heart.x,
            y: heart.y,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 1],
            y: heart.y - 100,
            x: heart.x + (Math.random() * 50 - 25),
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
          onAnimationComplete={() => {
            setHearts((prev) => prev.filter((h) => h.id !== heart.id));
          }}
          className='absolute text-2xl pointer-events-none'
        >
          ❤️
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { NativeDialog } from './ui/native-dialog';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import AutoPlayAudio from './salesman-audio-player';
import { Fireworks } from './ui/fireworks';
import useWebhookPolling, { WebhookEvent } from '@/hooks/useWebhookPolling';
import { useState } from 'react';

interface WebhookListenerProps {
  onNewDeal?: (deal: WebhookEvent) => void;
  onNewDealError?: (e: Error) => void;
}
export default function WebhookListener({
  onNewDeal,
  onNewDealError,
}: WebhookListenerProps) {
  const messages = useWebhookPolling(
    (deal) => {
      onNewDeal?.(deal);
    },
    (e) => {
      onNewDealError?.(e);
    }
  );
  const [selectedDeal, setSelectedDeal] = useState(null);

  return (
    <AnimatePresence>
      {messages.map((msg, i) => (
        <NativeDialog
          key={i}
          className='no-scrollbar overflow-hidden'
          title='New Deal Created'
          onClose={() => console.log('closing dialog')}
          open={true}
          variant={'large'}
        >
          <div className='flex flex-col gap-4 items-center'>
            <DotLottieReact
              src='https://lottie.host/550d7438-3f6c-4bb4-b031-1a611e1ee71a/IEu9ucanEX.lottie'
              loop
              autoplay
            />
            <motion.div
              initial={{ scale: 0, y: 100 }}
              animate={{
                scale: 1,
                y: 0,
                transition: { duration: 0.2, delay: 0.7 },
              }}
              exit={{ scale: 0 }}
              className='flex flex-col items-center gap-4'
            >
              <p className='text-2xl'>New Deal Alert</p>
              <h3 className='text-4xl font-extrabold'>
                {msg.owner
                  ? `${msg.owner.firstName} ${msg.owner.lastName}`
                  : 'N/A'}
              </h3>
              <strong>Deal:</strong> {msg.deal.properties.dealname} <br />
              <span className='text-6xl font-extrabold text-primary'>+1</span>
              <AutoPlayAudio src='/audio/alert.mp3' />
            </motion.div>
          </div>
          <Fireworks />
        </NativeDialog>
      ))}
    </AnimatePresence>
  );
}

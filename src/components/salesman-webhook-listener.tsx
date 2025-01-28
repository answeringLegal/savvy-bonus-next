import { HSEvent } from '@/app/api/webhook/route';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { NativeDialog } from './ui/native-dialog';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import AutoPlayAudio from './salesman-audio-player';
import { Fireworks } from './ui/fireworks';

interface WebhookEvent {
  event: HSEvent;
  deal: {
    properties: {
      dealname: string;
      pipeline: string;
      dealstage: string;
      createddate: string;
      closedate?: string;
    };
  };
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface WebhookListenerProps {
  onNewDeal?: (deal: WebhookEvent) => void;
  onNewDealError?: (e: Event) => void;
}
export default function WebhookListener({
  onNewDeal,
  onNewDealError,
}: WebhookListenerProps) {
  const [messages, setMessages] = useState<WebhookEvent[]>([]);
  const [showNewDealAlert, setShowNewDealAlert] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<WebhookEvent | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/webhook');

    eventSource.onmessage = (event) => {
      console.log('Webhook Event:', event.data);
      const parsedData = JSON.parse(event.data) as WebhookEvent[];

      // Show new deal alert if any of the events is a "deal.creation"
      const newDeal = parsedData.find(
        (msg) => msg.event.subscriptionType === 'deal.creation'
      );
      if (newDeal) {
        setSelectedDeal(newDeal);
        setShowNewDealAlert(true);
        onNewDeal?.(newDeal);
        setTimeout(() => {
          setShowNewDealAlert(false);
        }, 5000);
      }

      setMessages((prev) => [...prev, ...parsedData]);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      onNewDealError?.(error);

      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    // remove messages after 5 seconds
    const timer = setTimeout(() => {
      setMessages((prev) => prev.slice(1));
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [messages]);

  return (
    <AnimatePresence>
      {messages.map((msg, i) => (
        <NativeDialog
          key={i}
          className='no-scrollbar overflow-hidden'
          title='New Deal Created'
          onClose={() => {
            console.log('closing dialog');
          }}
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
      {/* </ul> */}
    </AnimatePresence>
  );
}

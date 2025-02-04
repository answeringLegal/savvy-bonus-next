import { useEffect, useState } from 'react';

export interface HSEvent {
  subscriptionType: 'deal.creation' | 'deal.propertyChange';
}

export interface WebhookEvent {
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

export default function useWebhookPolling(
  onNewDeal?: (deal: WebhookEvent) => void,
  onNewDealError?: (e: Error) => void
) {
  const [messages, setMessages] = useState<WebhookEvent[]>([]);

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const response = await fetch('/api/webhook');
        if (!response.ok) throw new Error('Failed to fetch webhook events');
        const data = await response.json();

        if (data.length > 0) {
          console.log('Webhook Event:', data);

          setMessages((prev) => [...prev, ...data]);

          // Check for new deals
          data.forEach((msg: WebhookEvent) => {
            if (msg.event.subscriptionType === 'deal.creation') {
              onNewDeal?.(msg);
            }
          });
        }
      } catch (error) {
        const err = new Error(
          'Failed to fetch webhook events: Caught: ' + error
        );
        onNewDealError?.(err);
        console.error('Polling Error:', error);
      }
    };

    // Poll
    const interval = setInterval(fetchWebhooks, 1000);
    fetchWebhooks(); // Initial fetch

    return () => clearInterval(interval);
  }, [onNewDeal]);

  // Clear messages
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setMessages([]);
  //   }, 10000);

  //   return () => clearTimeout(timer);
  // }, [messages]);
  useEffect(() => {
    // remove messages after 5 seconds
    const timer = setTimeout(() => {
      setMessages((prev) => prev.slice(1));
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [messages]);

  return messages;
}

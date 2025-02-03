import { hubspotAPI } from '@/lib/axios';

const globalClients = globalThis as unknown as {
  sseClients: WritableStreamDefaultWriter<any>[];
};

if (!globalClients.sseClients) {
  globalClients.sseClients = [];
}

export interface HSEvent {
  subscriptionType: 'deal.creation' | 'deal.propertyChange';
  eventId: number;
  subscriptionId: number;
  portalId: number;
  appId: number;
  occurredAt: number;
  attemptNumber: number;
  objectId: number;
  propertyName?: string;
  propertyValue?: string;
  changeFlag?: string;
  changeSource?: string;
  sourceId: string;
}

export async function POST(req: Request) {
  const events = (await req.json()) as HSEvent[];
  console.log('Webhook Received:', events);

  console.log('Number of connected clients:', globalClients.sseClients.length);

  // Process each event
  const validDeals = await Promise.all(
    events.map(async (event) => {
      console.log('Processing Event:', event);
      if (event.subscriptionType === 'deal.creation') {
        const deal = await fetchHubSpotDeal(event.objectId);
        console.log('deal', deal);
        console.log('deal pipeline', deal.properties.pipeline);
        console.log(
          'isDealInPipeline',
          deal.properties.pipeline === '137772405'
        );

        // Ensure deal exists and check pipeline
        if (deal && deal.properties.pipeline === '137772405') {
          console.log('Valid Deal:', deal);

          // // the owner might not be available when the event is fired, it will be some time in the future
          // while (!deal.properties.hubspot_owner_id) {
          //   // Wait for 5 seconds before retrying
          //   await new Promise((resolve) => setTimeout(resolve, 5000));
          //   const updatedDeal = await fetchHubSpotDeal(event.objectId);
          //   if (updatedDeal) {
          //     deal.properties.hubspot_owner_id =
          //       updatedDeal.properties.hubspot_owner_id;
          //   }
          // }

          // Fetch owner details
          const owner = await fetchHubSpotOwner(
            deal.properties.hubspot_owner_id
          );

          return { event, deal, owner };
        }
      }
      return null;
    })
  );

  // Filter out invalid deals
  const filteredDeals = validDeals.filter((deal) => deal !== null);

  if (filteredDeals.length > 0) {
    // Notify all connected SSE clients
    globalClients.sseClients.forEach((client) => {
      try {
        console.log('Sending message to client:', filteredDeals);
        client.write(`data: ${JSON.stringify(filteredDeals)}\n\n`);
      } catch (err) {
        console.error('Error sending message to client:', err);
      }
    });
  }

  return Response.json({ message: 'Success' }, { status: 200 });
}

// SSE Endpoint for Frontend to Listen for Webhooks
export async function GET(req: Request) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  writer.write(`event: connected\ndata: "SSE Connected"\n\n`);

  globalClients.sseClients.push(writer); // Store the client connection

  // Remove client when connection closes
  req.signal.addEventListener('abort', () => {
    const index = globalClients.sseClients.indexOf(writer);
    if (index !== -1) {
      globalClients.sseClients.splice(index, 1);
      writer.close();
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

async function fetchHubSpotDeal(objectId: number) {
  try {
    const response = await hubspotAPI.get(
      `/objects/deals/${objectId}?properties=hubspot_owner_id,pipeline,dealstage,dealname,createddate,closedate`
    );

    if (response.status === 200) {
      return response.data;
    } else {
      console.warn(`Failed to fetch deal with objectId: ${objectId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching deal ${objectId}:`, error);
    return null;
  }
}

async function fetchHubSpotOwner(ownerId: number) {
  console.log('Fetching owner:', ownerId);
  try {
    const response = await hubspotAPI.get(`/owners/${ownerId}?idProperty=id`);

    if (response.status === 200) {
      return response.data;
    } else {
      console.warn(`Failed to fetch owner with ID: ${ownerId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching owner ${ownerId}:`, error);
    return null;
  }
}

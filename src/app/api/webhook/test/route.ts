import { NextRequest } from 'next/server';
import { hubspotAPI } from '@/lib/axios';

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

export async function POST(req: NextRequest) {
  const events = (await req.json()) as HSEvent[];
  console.log('Webhook Received:', events);

  const validDeals = await Promise.all(
    events.map(async (event) => {
      if (event.subscriptionType === 'deal.creation') {
        const deal = await fetchHubSpotDeal(event.objectId);

        if (deal && deal.properties.pipeline === '137772405') {
          console.log('Valid Deal:', deal);

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

  const filteredDeals = validDeals.filter((deal) => deal !== null);
  if (filteredDeals.length > 0) {
    console.log('Sending deals to connected SSE clients...');
    sendSSE(filteredDeals); // Sends data to clients
  }

  return Response.json({ message: 'Success' }, { status: 200 });
}

// **SSE Stream for Clients to Listen**
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      function send(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      const keepAlive = setInterval(() => {
        send({ ping: 'keep-alive' });
      }, 25000); // Prevents Vercel from closing the connection

      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        controller.close();
      });

      // Store stream controller to send data later
      clients.push(controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// **Keeps track of active clients**
const clients: ReadableStreamDefaultController[] = [];

// **Send SSE Updates to All Clients**
function sendSSE(data: any) {
  clients.forEach((client, index) => {
    try {
      client.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
      );
    } catch (err) {
      console.error(`Error sending to client ${index}:`, err);
      client.close();
    }
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

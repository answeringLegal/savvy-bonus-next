import { hubspotAPI } from '@/lib/axios';

// Store the latest webhook events in-memory
const webhookEvents: any[] = [];

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

// **Webhook Handling - Store New Events**
export async function POST(req: Request) {
  const events = (await req.json()) as HSEvent[];
  console.log('Webhook Received:', events);

  // Process each event
  await Promise.all(
    events.map(async (event) => {
      if (event.subscriptionType === 'deal.creation') {
        const deal = await fetchHubSpotDeal(event.objectId);

        if (deal && deal.properties.pipeline === '137772405') {
          console.log('Valid Deal:', deal);

          // Fetch owner details
          const owner = await fetchHubSpotOwner(
            deal.properties.hubspot_owner_id
          );

          const newEvent = { event, deal, owner };
          webhookEvents.push(newEvent);

          return newEvent;
        }
      }
      return null;
    })
  );

  return Response.json({ message: 'Success' }, { status: 200 });
}

// **Polling API - Fetch New Webhook Events**
export async function GET() {
  const newEvents = [...webhookEvents];
  webhookEvents.length = 0; // Clear events after sending

  return Response.json(newEvents, { status: 200 });
}

// **Fetch HubSpot Deal**
async function fetchHubSpotDeal(objectId: number) {
  try {
    const response = await hubspotAPI.get(
      `/objects/deals/${objectId}?properties=hubspot_owner_id,pipeline,dealstage,dealname,createddate,closedate`
    );
    return response.status === 200 ? response.data : null;
  } catch (error) {
    console.error(`Error fetching deal ${objectId}:`, error);
    return null;
  }
}

// **Fetch HubSpot Owner**
async function fetchHubSpotOwner(ownerId: number) {
  try {
    const response = await hubspotAPI.get(`/owners/${ownerId}?idProperty=id`);
    return response.status === 200 ? response.data : null;
  } catch (error) {
    console.error(`Error fetching owner ${ownerId}:`, error);
    return null;
  }
}

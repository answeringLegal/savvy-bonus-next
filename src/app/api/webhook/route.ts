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
  const body = (await req.json()) as HSEvent[];
  console.log('Webhook Received:', body);

  console.log('Number of connected clients:', globalClients.sseClients.length);

  // Notify all connected SSE clients
  globalClients.sseClients.forEach((client) => {
    try {
      console.log('Sending message to client:', body);
      client.write(`data: ${JSON.stringify(body)}\n\n`);
    } catch (err) {
      console.error('Error sending message to client:', err);
    }
  });

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

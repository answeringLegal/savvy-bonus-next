import { hubspotAPI } from '@/lib/axios';
import { HubSpotAPIListResponse, HubSpotOwner } from '@/types/hubspot';

export async function GET(req: Request, res: Response) {
  try {
    const response = await hubspotAPI.get<HubSpotAPIListResponse<HubSpotOwner>>(
      '/owners'
    );
    console.log('response back from hubspot ', response);
    if (response.status === 200) {
      return Response.json(response.data, {
        status: response.status,
      });
    }
    return Response.json(
      {
        message: 'An error occured',
      },
      {
        status: response.status,
      }
    );
  } catch (error: any) {
    console.error('an error occured', error);
    return Response.json(error, {
      status: 500,
    });
  }
}

import { hubspotAPI } from '@/lib/axios';
import { HubSpotAPIListResponse, HubSpotOwner } from '@/types/hubspot';

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
  res: Response
) {
  if (params.id) {
    return Response.json(
      {
        message: 'Please provide an id',
      },
      {
        status: 400,
      }
    );
  }

  try {
    const response = await hubspotAPI.get<HubSpotAPIListResponse<HubSpotOwner>>(
      '/owners/' + params.id + '?idProperty=id'
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
  } catch (error) {
    console.error('an error occured', error);
    return Response.json(error, {
      status: 500,
    });
  }
}

import { hubspotAPI } from '@/lib/axios';

export async function GET(
  req: Request,
  { param }: { param: { id: string } },
  res: Response
) {
  if (param.id) {
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
    const response = await hubspotAPI.get<Error>(
      '/owners/' + param.id + '?idProperty=id'
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

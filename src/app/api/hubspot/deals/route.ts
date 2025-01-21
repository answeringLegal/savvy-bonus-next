import { hubspotAPI } from '@/lib/axios';
import {
  BonusBlasterDeal,
  HubSpotAPIListResponse,
  HubSpotDeal,
  HubSpotOwner,
} from '@/types/hubspot';

export async function POST(req: Request, res: Response) {
  let requestBody;
  try {
    requestBody = (await req.json()) as {
      filterGroups: {
        filters: {
          propertyName: string;
          operator: string;
          value: string;
          highValue?: string;
        }[];
      }[];
    };
    // console.log(requestBody);
  } catch (error) {
    return Response.json({ message: 'Invalid request body' }, { status: 400 });
  }

  try {
    // make request to hubspot
    const dealsResponse = await hubspotAPI.post<
      HubSpotAPIListResponse<HubSpotDeal[]>
    >('/objects/deals/search', JSON.stringify(requestBody));

    // transform response when successful
    if (dealsResponse.status === 200) {
      // remove deals with no date_paid
      const deals = dealsResponse.data.results.filter(
        (deal) => deal.properties.date_paid
      );

      // filter deals further by checking if the date_paid is within the date range
      const dealsPaidWithinDateRange = deals.filter((deal) => {
        // check if createdate filter was applied
        let dateFilterApplied = false;
        let dateMinValue;
        let dateMaxValue;
        requestBody.filterGroups.forEach((group) => {
          group.filters.forEach((filter) => {
            if (filter.propertyName === 'createdate') {
              dateFilterApplied = true;
              dateMinValue = filter.value;
              dateMaxValue = filter.highValue;
            }
          });
        });

        if (!dateFilterApplied || !dateMinValue || !dateMaxValue) {
          return true;
        }

        // check if deal was paid within date range
        const datePaid = new Date(deal.properties.date_paid);
        const startDate = new Date(dateMinValue);
        const endDate = new Date(dateMaxValue);

        return datePaid >= startDate && datePaid <= endDate;
      });

      // get owner for each deal
      const dealPromises = dealsPaidWithinDateRange.map(async (deal) => {
        // console.log('deal', deal);
        const ownerResponse = await hubspotAPI.get<HubSpotOwner>(
          '/owners/' + deal.properties.hubspot_owner_id + '?idProperty=id'
        );

        if (ownerResponse.status !== 200) {
          throw new Error('Failed to fetch owner');
        }

        const bonusBlastDeal: BonusBlasterDeal = {
          ...deal,
          owner: ownerResponse.data,
        };
        return bonusBlastDeal;
      });

      try {
        const bonusBlastDeals = await Promise.all(dealPromises);
        // console.log('bonusBlastDeals', bonusBlastDeals);

        const bonusBlastDealsGroupedByOwner = Object.groupBy(
          bonusBlastDeals,
          ({ owner }) => owner.firstName + ' ' + owner.lastName
        );
        return Response.json(bonusBlastDealsGroupedByOwner, {
          status: dealsResponse.status,
        });
      } catch (error) {
        console.error('Error processing deals:', error);
        return Response.json({ message: 'An error occurred' }, { status: 500 });
      }
    } else {
      // return error response
      return Response.json(
        {
          message: 'An error occurred',
        },
        {
          status: dealsResponse.status,
        }
      );
    }
  } catch (error: any) {
    console.error('an error occured', error);
    return Response.json(error, {
      status: 500,
    });
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const response = await hubspotAPI.get<
      HubSpotAPIListResponse<HubSpotDeal[]>
    >('/deals');
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

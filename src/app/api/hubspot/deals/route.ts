import { hubspotAPI } from '@/lib/axios';
import {
  BonusBlasterDeal,
  HubSpotAPIListResponse,
  HubSpotDeal,
  HubSpotOwner,
} from '@/types/hubspot';
import { format } from 'date-fns';
let num_requests = 0;
let ownersCache: { [key: string]: HubSpotOwner[] } = {};
let todayDateKey = format(new Date(), 'yyyy-MM-dd');
// export async function POST(req: Request, res: Response) {
//   let ownersResponse;
//   num_requests = num_requests + 1;
//   console.log('POST request received for deals');
//   console.log('Number of requests: ', num_requests);
//   let requestBody;
//   try {
//     requestBody = (await req.json()) as {
//       filterGroups: {
//         filters: {
//           propertyName: string;
//           operator: string;
//           value: string;
//           highValue?: string;
//         }[];
//       }[];
//       isPaidDeal?: boolean;
//     };
//     // console.log(requestBody);
//   } catch (error) {
//     return Response.json({ message: 'Invalid request body' }, { status: 400 });
//   }

//   try {
//     // make request to hubspot
//     const dealsResponse = await hubspotAPI.post<
//       HubSpotAPIListResponse<HubSpotDeal[]>
//     >('/objects/deals/search', JSON.stringify(requestBody));

//     // transform response when successful
//     if (dealsResponse.status === 200) {
//       console.log('dealsResponse total', dealsResponse.data.total);
//       // remove deals with no date_paid
//       let deals = dealsResponse.data.results;
//       if (requestBody.isPaidDeal) {
//         deals = filterDealsByPaymentDate(
//           dealsResponse.data.results,
//           requestBody
//         );
//       }

//       // get all owners
//       // check if owners are in cache
//       let owners = ownersCache[todayDateKey];

//       if (!owners || owners.length === 0) {
//         console.log('owners not found in cache');
//         ownersResponse = await hubspotAPI.get<
//           HubSpotAPIListResponse<HubSpotOwner[]>
//         >('/owners');

//         if (ownersResponse.status !== 200) {
//           throw new Error('Failed to fetch owners');
//         }
//         console.log('ownersResponse', ownersResponse.data);

//         // cache owners
//         owners = ownersResponse.data.results;
//         ownersCache[todayDateKey] = owners;
//       }

//       // get owner for each deal
//       const mappedBonusBlastDeals = deals.map((deal) => {
//         const bonusBlastDeal: BonusBlasterDeal = {
//           ...deal,
//           owner: owners.find(
//             (owner) => owner.id === deal.properties.hubspot_owner_id
//           ) as HubSpotOwner,
//         };
//         return bonusBlastDeal;
//       });

//       // group deals by owner
//       const bonusBlastDealsGroupedByOwner = Object.groupBy(
//         mappedBonusBlastDeals,
//         ({ owner }) => owner.firstName + ' ' + owner.lastName
//       );

//       return Response.json(bonusBlastDealsGroupedByOwner, {
//         status: dealsResponse.status,
//       });
//     } else {
//       console.error(
//         'an error occured while fetching deals, the server did not return a 200 status code'
//       );
//       // return error response
//       return Response.json(
//         {
//           message:
//             'An error occured while fetching deals, the server did not return a 200 status code',
//         },
//         {
//           status: dealsResponse.status,
//         }
//       );
//     }
//   } catch (error: any) {
//     console.error('an error occured', error);
//     return Response.json(error, {
//       status: 500,
//     });
//   }
// }

export async function POST(req: Request) {
  let ownersResponse;
  num_requests = num_requests + 1;
  console.log('POST request received for deals');
  console.log('Number of requests: ', num_requests);
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
      isPaidDeal?: boolean;
    };
  } catch (error) {
    return Response.json({ message: 'Invalid request body' }, { status: 400 });
  }

  try {
    // Fetch all pages of deals from HubSpot
    const allDeals = await fetchAllDeals(requestBody);
    console.log('Total deals fetched:', allDeals.length);

    // Filter if needed
    let deals = allDeals;
    if (requestBody.isPaidDeal) {
      deals = filterDealsByPaymentDate(allDeals, requestBody);
    }

    // Get all owners (cached for performance)
    let owners = ownersCache[todayDateKey];
    if (!owners || owners.length === 0) {
      console.log('Owners not found in cache, fetching...');
      ownersResponse = await hubspotAPI.get<
        HubSpotAPIListResponse<HubSpotOwner[]>
      >('/owners');

      if (ownersResponse.status !== 200) {
        throw new Error('Failed to fetch owners');
      }
      owners = ownersResponse.data.results;
      ownersCache[todayDateKey] = owners;
    }

    // Map deals to include owner details
    const mappedBonusBlastDeals = deals.map((deal) => ({
      ...deal,
      owner: owners.find(
        (owner) => owner.id === deal.properties.hubspot_owner_id
      ) as HubSpotOwner,
    }));

    // Group deals by owner
    const bonusBlastDealsGroupedByOwner = Object.groupBy(
      mappedBonusBlastDeals,
      ({ owner }) => owner.firstName + ' ' + owner.lastName
    );

    return Response.json(bonusBlastDealsGroupedByOwner, { status: 200 });
  } catch (error: any) {
    console.error('An error occurred', error);
    return Response.json({ message: error.message }, { status: 500 });
  }
}

function filterDealsByPaymentDate(
  dealsResponse: HubSpotDeal[],
  requestBody: {
    filterGroups: {
      filters: {
        propertyName: string;
        operator: string;
        value: string;
        highValue?: string;
      }[];
      isPaidDeal?: boolean;
    }[];
  }
) {
  const deals = dealsResponse.filter((deal) => deal.properties.date_paid);

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
  return dealsPaidWithinDateRange;
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

async function fetchAllDeals(
  requestBody: any,
  after: string | null = null,
  accumulatedDeals: HubSpotDeal[] = []
): Promise<HubSpotDeal[]> {
  try {
    // prepare request payload, including pagination token if available
    const payload = after ? { ...requestBody, after } : requestBody;
    const response = await hubspotAPI.post<
      HubSpotAPIListResponse<HubSpotDeal[]>
    >('/objects/deals/search', JSON.stringify(payload));

    if (response.status !== 200) {
      throw new Error('Failed to fetch deals');
    }

    const { results, paging } = response.data;
    accumulatedDeals.push(...results);

    // Check if there's more data to fetch
    if (paging?.next?.after) {
      console.log(
        `Fetching next page of deals (after: ${paging.next.after})...`
      );
      return fetchAllDeals(requestBody, paging.next.after, accumulatedDeals);
    }

    return accumulatedDeals; // Return all accumulated deals once pagination is complete
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw new Error('Failed to fetch all deals');
  }
}

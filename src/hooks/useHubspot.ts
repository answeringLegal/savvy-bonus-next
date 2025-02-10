import {
  BonusBlasterDeals,
  HubSpotAPIListResponse,
  HubSpotDeal,
  HubSpotOwner,
} from '@/types/hubspot';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';

// region Deals
const useListDeals = () => {
  return useQuery<HubSpotAPIListResponse<HubSpotDeal[]>, Error>({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await fetch('/api/hubspot/deals');
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
  });
};

const useListDeal = (id: string) => {
  return useQuery<HubSpotAPIListResponse<HubSpotDeal[]>, Error>({
    queryKey: ['deal', id],
    queryFn: async () => {
      const response = await fetch(`/api/hubspot/deals/${id}`);
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
  });
};

/*
  ========================================
  /search
  ========================================

  example body:
  {
    "filterGroups": [
        {
            "filters": [
                {
                    "propertyName": "createdate",
                    "operator": "BETWEEN",
                    "value": "2025-01-01",
                    "highValue": "2025-04-01"
                },
                {
                    "propertyName": "dealstage",
                    "operator": "IN",
                    "values": ["240513405", "240513408"]
                },
                {
                    "propertyName": "previously_paying_customer_",
                    "operator": "IN",
                    "values": ["No"]
                },
                {
                    "operator": "IN",
                    "propertyName": "pipeline",
                    "values": [
                        "137772405"
                    ]
                }
            ]
        }
       
    ],
    "limit": "10",
    "properties": [
        "date_paid",
        "hubspot_owner_id",
        "deal_name"
    ]
}
*/
const useQualifyingDeals = () => {
  const queryClient = useQueryClient();
  return useMutation<
    HubSpotAPIListResponse<HubSpotDeal[]>,
    Error,
    { startDate?: string; endDate?: string }
  >({
    mutationFn: async ({ startDate, endDate }) => {
      const body = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'createdate',
                operator: 'BETWEEN',
                value: startDate,
                highValue: endDate,
              },
              {
                propertyName: 'dealstage',
                operator: 'IN',
                values: ['240513405', '240513408'],
              },
              {
                propertyName: 'previously_paying_customer_',
                operator: 'IN',
                values: ['No'],
              },
              {
                operator: 'IN',
                propertyName: 'pipeline',
                values: ['137772405'],
              },
            ],
          },
        ],
        limit: '10',
        properties: ['date_paid', 'hubspot_owner_id', 'dealname'],
        isPaidDeal: true,
      };
      const response = await fetch('/api/hubspot/deals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Error fetching data');
      console.log('response', response);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['deals'],
      });
    },
  });
};

let num_fetches_live = 0;
/**
 *
 * @param startDate
 * @param endDate
 * @description Fetches live deals from Hubspot API where the deal is in the 'Onboarding2' pipeline and not a previously paying customer
 * @returns
 */
const useFetchLiveQualifyingDeals = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<BonusBlasterDeals, Error>({
    queryKey: ['live-deals'],
    queryFn: async () => {
      console.log('fetching live qualifying deals', num_fetches_live++);
      const filters = [
        // {
        //   propertyName: 'dealstage',
        //   operator: 'IN',
        //   values: ['240513405', '240513408'], // 'paid' or 'canceled'
        // },
        {
          propertyName: 'previously_paying_customer_',
          operator: 'IN',
          values: ['No'],
        },
        {
          operator: 'IN',
          propertyName: 'pipeline',
          values: ['137772405'], // 'Onboarding2'
        },
      ] as any[];

      if (startDate && endDate) {
        filters.push({
          propertyName: 'createdate',
          operator: 'BETWEEN',
          value: startDate,
          highValue: endDate,
        });
      }
      const body = {
        filterGroups: [
          {
            filters,
          },
        ],
        isPaidDeal: false,
        limit: '200',
        properties: ['date_paid', 'hubspot_owner_id', 'dealname'],
      };
      const response = await fetch('/api/hubspot/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
};

/**
 *
 * @param startDate
 * @param endDate
 * @description Fetches qualifying deals based on the provided date range
 * @returns
 */

let num_fetches_qual = 0;
const useFetchQualifyingDeals = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<BonusBlasterDeals, Error>({
    queryKey: ['deals'],
    queryFn: async () => {
      console.log('fetching qualifying deals', num_fetches_qual++);
      const filters = [
        {
          operator: 'IN',
          propertyName: 'dealstage',
          values: ['240513405', '240513408'],
        },
        {
          operator: 'IN',
          propertyName: 'previously_paying_customer_',
          values: ['No'],
        },
        {
          operator: 'IN',
          propertyName: 'pipeline',
          values: ['137772405'],
        },
      ] as any[];

      if (startDate && endDate) {
        filters.push({
          propertyName: 'date_paid',
          operator: 'BETWEEN',
          value: startDate,
          highValue: endDate,
          dateTimeFormat: 'DATE',
        });
      }
      const body = {
        filterGroups: [
          {
            filters,
          },
        ],
        limit: '200',
        properties: ['date_paid', 'hubspot_owner_id', 'dealname'],
        isPaidDeal: true,
      };
      const response = await fetch('/api/hubspot/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

const useFetchTodayDeals = () => {
  return useQuery<BonusBlasterDeals, Error>({
    queryKey: ['today-deals'],
    queryFn: async () => {
      const filters = [
        {
          operator: 'IN',
          propertyName: 'previously_paying_customer_',
          values: ['No'],
        },
        {
          operator: 'IN',
          propertyName: 'pipeline',
          values: ['137772405'],
        },
        {
          propertyName: 'createdate',
          operator: 'BETWEEN',
          value: format(new Date(), 'yyyy-MM-dd'),
          highValue: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // tomorrow, to get today's deals,
        },
      ] as any[];

      const body = {
        filterGroups: [
          {
            filters,
          },
        ],
        limit: '20',
        properties: ['date_paid', 'hubspot_owner_id', 'dealname'],
        isPaid: false,
      };
      const response = await fetch('/api/hubspot/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
  });
};

// region Owners

const useGetOwners = () => {
  return useQuery<HubSpotAPIListResponse<HubSpotOwner[]>, Error>({
    queryKey: ['owners'],
    queryFn: async () => {
      const response = await fetch('/api/hubspot/owners');
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
  });
};

const useGetOwner = (id: string) => {
  return useQuery<HubSpotAPIListResponse<HubSpotOwner>, Error>({
    queryKey: ['owner', id],
    queryFn: async () => {
      const response = await fetch(`/api/hubspot/owners/${id}`);
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
  });
};

//end region Owners

export {
  useListDeals,
  useListDeal,
  useQualifyingDeals,
  useFetchLiveQualifyingDeals,
  useFetchTodayDeals,
  useFetchQualifyingDeals,
  useGetOwners,
  useGetOwner,
};

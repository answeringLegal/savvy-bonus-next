export type HubSpotDeal = {
  id: string;
  properties: {
    createdate: string;
    date_paid: string;
    hs_lastmodifieddate: string;
    hs_object_id: string;
    hubspot_owner_id: string;
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  owner: HubSpotOwner;
};

export type BonusBlasterDeal = HubSpotDeal & {
  owner: HubSpotOwner;
};

export type HubSpotOwner = {
  id: string;
  email: string;
  type: 'PERSON';
  firstName: string;
  lastName: string;
  userId: number;
  userIdIncludingInactive: number;
  createdAt: string;
  updatedAt: string;
  archived: boolean;

  teams?: [
    {
      id: number;
      name:
        | 'Salesmen'
        | 'Sales Admin'
        | 'Tech Team'
        | 'Marketing'
        | 'Support'
        | 'Billing'
        | 'Admin';
      primary: boolean;
    }
  ];
};

export type HubSpotAPIListResponse<T> = {
  results: T;
  total: number;
  paging: {
    next: string;
    prev: string;
  };
};

export type BonusBlasterDeals = Record<string, BonusBlasterDeal[]>;

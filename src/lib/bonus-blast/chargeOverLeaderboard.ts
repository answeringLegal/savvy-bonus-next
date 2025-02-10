import { MAX_PARTICIPANTS } from '@/config';
import { BonusBlasterDeal, BonusBlasterDeals } from '@/types/hubspot';
import { TransactionData } from '@/types/transactions';

type LeaderboardData = {
  orderedSalesmen: {
    owner: string;
    deals: TransactionData[] | BonusBlasterDeal[];
  }[];
  podium: {
    place: number;
    owner: string;
    deals: TransactionData[] | BonusBlasterDeal[];
  }[];
  totalPaidAccounts: number;
  downloadCSV?: () => void;
};

function getLeaderboardForChargeOverTransactions(
  transactions: TransactionData[]
): LeaderboardData {
  const transactionsGroupedBySaleman = Object.groupBy(
    transactions,
    (trx) => trx.metadata.sales_rep
  ) as Record<string, TransactionData[]>;

  // order top 8
  const orderedTransactionsBySaleman = Object.entries(
    transactionsGroupedBySaleman
  )
    .map(([owner, deals]) => {
      return {
        owner,
        deals: deals || [],
      };
    })
    .slice(0, MAX_PARTICIPANTS)
    .sort((a, b) => b?.deals?.length - a?.deals?.length);

  const transactionsPodium = [
    { ...orderedTransactionsBySaleman[1], place: 2 },
    { ...orderedTransactionsBySaleman[0], place: 1 },
    { ...orderedTransactionsBySaleman[2], place: 3 },
  ];

  const totalPaidTransactions = Object.values(
    transactionsGroupedBySaleman
  ).reduce((acc, deals) => acc + deals?.length || 0, 0);

  function downloadTransactionResultsAsCSV() {
    if (!transactionsGroupedBySaleman)
      return [
        ['Salesman', 'Customer', 'First Payment', 'CreateDate', 'Customer ID'],
      ];
    const csvContent = [
      ['Salesman', 'DealName', 'PaidDate', 'CreateDate', 'Customer ID'],
      ...Object.entries(transactionsGroupedBySaleman)
        .map(([owner, deals]) => {
          return {
            owner,
            deals,
          };
        })
        .flatMap((salesman) =>
          salesman.deals.map((deal) => [
            JSON.stringify(salesman.owner),
            JSON.stringify(deal.metadata.customer),
            JSON.stringify(new Date(deal.first_payment.toDate())),
            JSON.stringify(deal.metadata.created),
            deal.id,
          ])
        ),
    ]
      .map((e) => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bonus_blast_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    orderedSalesmen: orderedTransactionsBySaleman,
    podium: transactionsPodium,
    totalPaidAccounts: totalPaidTransactions,
    downloadCSV: downloadTransactionResultsAsCSV,
  };
}

function getLeaderboardForHubspotDeals(
  deals: BonusBlasterDeals
): LeaderboardData {
  const orderedSalesmen = Object.entries(deals)
    .map(([owner, deals]) => {
      return {
        owner,
        deals,
      };
    })
    .slice(0, MAX_PARTICIPANTS)
    .sort((a, b) => b?.deals?.length - a?.deals?.length);

  const salesmenPodium = [
    { ...orderedSalesmen[1], place: 2 },
    { ...orderedSalesmen[0], place: 1 },
    { ...orderedSalesmen[2], place: 3 },
  ];

  const totalPaidAccounts = Object.values(deals).reduce(
    (acc, deals) => acc + deals?.length || 0,
    0
  );

  return {
    orderedSalesmen,
    podium: salesmenPodium,
    totalPaidAccounts,
  };
}

export {
  getLeaderboardForChargeOverTransactions,
  getLeaderboardForHubspotDeals,
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  QuerySnapshot,
  setDoc,
  where,
} from 'firebase/firestore';
import { TransactionData, transactionConverter } from '@/types/transactions';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';

export const INVALID_SALES_REP = [
  'Andrew Shatles',
  'Ben Shatles',
  'Benjamin Shatles',
  'Alyssa Accardi',
  'Christine Yandolli',
];

// Hook to fetch only bonus-eligible transactions for a given quarter
/**
 *
 * @param quarterKey eg. 'Q1_2025'
 * @description Fetch only bonus-eligible (transactions paid in the quarter and stayed in the 'Current' state for at least 30 Day during the competition window: start of quarter to end of quarter + 30 days) transactions for a given quarter
 *
 */
const useGetBonusEligibleTransactions = (quarterKey: string) => {
  return useQuery<TransactionData[], Error>({
    queryKey: ['bonus_eligible_transactions', quarterKey],
    queryFn: async () => {
      try {
        const transactionsRef = collection(
          db,
          `transactions/${quarterKey}/records`
        ).withConverter(transactionConverter);

        const q = query(transactionsRef, where('bonus_eligible', '==', true));
        const querySnapshot: QuerySnapshot<TransactionData> = await getDocs(q);

        const docs = querySnapshot.docs.map((doc) => doc.data());
        return docs.filter(
          (doc) =>
            doc.metadata.sales_rep &&
            !INVALID_SALES_REP.includes(doc.metadata.sales_rep)
        );
      } catch (error) {
        console.error('Error fetching bonus-eligible transactions:', error);
        throw new Error('Error fetching bonus-eligible transactions');
      }
    },
  });
};

const useGetTransactionsForQuarter = (quarterKey: string) => {
  return useQuery<TransactionData[], Error>({
    queryKey: ['transactions', quarterKey],
    queryFn: async () => {
      try {
        const querySnapshot: QuerySnapshot<TransactionData> = await getDocs(
          collection(db, `transactions/${quarterKey}/records`).withConverter(
            transactionConverter
          )
        );

        return querySnapshot.docs.map((doc) => doc.data());
      } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Error fetching transactions');
      }
    },
  });
};

const useGetTransactionsForThisQuarter = () => {
  const year = format(new Date(), 'yyyy');
  const quarter = format(new Date(), 'QQQ');
  const quarterKey = `${quarter}_${year}`;
  return useGetTransactionsForQuarter(quarterKey);
};

// **Fetch a specific transaction by Customer# in a given quarter**
const useGetTransaction = (quarterKey: string, customerId: string) => {
  return useQuery<TransactionData | null, Error>({
    queryKey: ['transaction', quarterKey, customerId],
    queryFn: async () => {
      try {
        const docRef = doc(
          db,
          `transactions/${quarterKey}/records`,
          customerId
        ).withConverter(transactionConverter);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
      } catch (error) {
        console.error('Error fetching transaction:', error);
        throw new Error('Error fetching transaction');
      }
    },
  });
};

// **Add or update a transaction**
const useUpsertTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<
    TransactionData,
    Error,
    { quarterKey: string; customerId: string; data: TransactionData }
  >({
    mutationFn: async ({ quarterKey, customerId, data }) => {
      try {
        const transactionRef = doc(
          db,
          `transactions/${quarterKey}/records`,
          customerId
        ).withConverter(transactionConverter);
        await setDoc(transactionRef, data, { merge: true });
        return data;
      } catch (error) {
        console.error('Error saving transaction:', error);
        throw new Error('Error saving transaction');
      }
    },
    onSuccess: (_, { quarterKey }) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', quarterKey] });
    },
  });
};

// **Delete a transaction**
const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, { quarterKey: string; customerId: string }>(
    {
      mutationFn: async ({ quarterKey, customerId }) => {
        try {
          await deleteDoc(
            doc(db, `transactions/${quarterKey}/records`, customerId)
          );
          return customerId;
        } catch (error) {
          console.error('Error deleting transaction:', error);
          throw new Error('Error deleting transaction');
        }
      },
      onSuccess: (_, { quarterKey }) => {
        queryClient.invalidateQueries({
          queryKey: ['transactions', quarterKey],
        });
      },
    }
  );
};

export {
  useGetTransactionsForQuarter,
  useGetTransaction,
  useUpsertTransaction,
  useDeleteTransaction,
  useGetTransactionsForThisQuarter,
  useGetBonusEligibleTransactions,
};

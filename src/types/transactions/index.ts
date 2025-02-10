import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';

export interface TransactionMetadata {
  customer: string;
  state: string;
  type_of_law: string;
  ltv: number;
  created: string;
  total: number;
  sales_rep: string;
  support_member: string;
  lead_source: string;
  source_medium: string;
  ads: string;
  invoiced_this_month: string;
}
export interface TransactionStatus {
  status: string;
  timestamp: string;
}
export interface TransactionData {
  id: string;
  quarter_key: string;
  first_payment: Timestamp;
  status: 'Current' | string;
  status_history: TransactionStatus[];
  bonus_eligible: boolean;
  last_updated: Date;
  metadata: TransactionMetadata;
}

export const transactionConverter = {
  toFirestore(transaction: TransactionData): DocumentData {
    return transaction;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): TransactionData {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as TransactionData;
  },
};

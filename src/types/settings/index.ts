import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

/** Firestore Model for General Settings */
export interface GeneralSetting {
  id?: string; // Firestore document ID (optional before save)
  name:
    | 'Theme'
    | 'ACCOUNT_VALUE'
    | 'MAX_PARTICIPANTS'
    | 'PAGE_TIMER_SEC_LIVE'
    | 'PAGE_TIMER_SEC_PAST';
  value: string | number;
  description?: string;
  data_type?: 'number' | 'string' | 'boolean' | 'date';
}

/** Firestore Model for Split Settings */
export interface SplitSetting {
  id?: string; // Firestore document ID (optional before save)
  ordinal: number;
  percentage: number;
  description: string;
}

/** Firestore Data Converter for Firestore SDK */
export const generalSettingConverter = {
  toFirestore(setting: GeneralSetting): DocumentData {
    return setting;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): GeneralSetting {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as GeneralSetting;
  },
};

export const splitSettingConverter = {
  toFirestore(setting: SplitSetting): DocumentData {
    return setting;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): SplitSetting {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as SplitSetting;
  },
};

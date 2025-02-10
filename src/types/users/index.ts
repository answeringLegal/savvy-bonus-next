import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

export interface UserData {
  hubspot: {
    name: string;
    id: string | number;
    meta: {
      firstName: string;
      lastName: string;
      isSalesman: boolean;
    };
  };
  chargeover: {
    name: string;
    id: string | number;
    meta: any;
  };
}

export const userConverter = {
  toFirestore(user: UserData): DocumentData {
    return user;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): UserData {
    const data = snapshot.data(options);
    return { ...data } as UserData;
  },
};

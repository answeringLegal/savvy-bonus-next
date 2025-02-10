import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  QuerySnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  GeneralSetting,
  generalSettingConverter,
  SplitSetting,
  splitSettingConverter,
} from '@/types/settings';

export const GENERAL_SETTINGS_DATABASE_KEY = 'bonus_blast_general_settings';
export const SPLIT_SETTINGS_KEY = 'bonus_blast_pool_split_settings';

const DEFAULT_GENERAl_SETTINGS: GeneralSetting[] = [
  {
    name: 'Theme',
    value: 'light',
    description: 'Change the theme of the application',
    data_type: 'string',
  },
  {
    name: 'ACCOUNT_VALUE',
    value: 100,
    description:
      'The value of each account (How much is each account worth towards the bonus pool)',
    data_type: 'number',
  },
  {
    name: 'MAX_PARTICIPANTS',
    value: 8,
    description: 'The maximum number of participants',
    data_type: 'number',
  },
  {
    name: 'PAGE_TIMER_SEC_LIVE',
    value: 300,
    description:
      'The number of seconds the "Live" page will show before changing',
    data_type: 'number',
  },
  {
    name: 'PAGE_TIMER_SEC_PAST',
    value: 60,
    description:
      'The number of seconds the "Past" page will show before changing',
    data_type: 'number',
  },
];

const DEFAULT_SPLIT_SETTINGS: SplitSetting[] = [
  {
    ordinal: 1,
    percentage: 0.3,
    description: 'First place',
  },
  {
    ordinal: 2,
    percentage: 0.2,
    description: 'Second place',
  },
  {
    ordinal: 3,
    percentage: 0.15,
    description: 'Third place',
  },
  {
    ordinal: 4,
    percentage: 0.1,
    description: 'Fourth place',
  },
  {
    ordinal: 5,
    percentage: 0.08,
    description: 'Fifth place',
  },
  {
    ordinal: 6,
    percentage: 0.07,
    description: 'Sixth place',
  },
  {
    ordinal: 7,
    percentage: 0.05,
    description: 'Seventh place',
  },
  {
    ordinal: 8,
    percentage: 0.05,
    description: 'Eighth place',
  },
];

const useGetThemeFromLocalStorage = () => {
  return useQuery<string>({
    queryKey: ['theme'],
    queryFn: async () => {
      const theme = localStorage.getItem('theme');

      console.log('theme', theme);
      if (theme) {
        return theme;
      } else {
        return 'light';
      }
    },
  });
};

const useSetThemeToLocalStorage = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: async (theme) => {
      localStorage.setItem('theme', theme);
      return theme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme'] });
    },
  });
};

const useGetSettings = () => {
  return useQuery<GeneralSetting[], Error>({
    queryKey: ['general_settings'],
    queryFn: async () => {
      try {
        const querySnapshot: QuerySnapshot<GeneralSetting> = await getDocs(
          collection(db, 'general_settings').withConverter(
            generalSettingConverter
          )
        );
        return querySnapshot.docs.map((doc) => doc.data());
      } catch (error) {
        console.error('Error getting general settings:', error);
        throw new Error('Error getting general settings');
      }
    },
  });
};

const useGetSettingByName = (name: string) => {
  return useQuery<GeneralSetting | null, Error>({
    queryKey: ['general_setting', name],
    queryFn: async () => {
      const docRef = doc(db, 'general_settings', name).withConverter(
        generalSettingConverter
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    },
  });
};

const useGetSetting = (id: string) => {
  return useQuery<GeneralSetting, Error>({
    queryKey: ['general_setting', id],
    queryFn: async () => {
      const docRef = doc(db, 'general_settings', id).withConverter(
        generalSettingConverter
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        throw new Error('Setting not found');
      }
    },
  });
};

const useAddSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<Partial<GeneralSetting>, Error, Partial<GeneralSetting>>({
    mutationFn: async (setting) => {
      try {
        const docRef = await addDoc(
          collection(db, 'general_settings').withConverter(
            generalSettingConverter
          ),
          setting
        );
        return { id: docRef.id, ...setting };
      } catch (error) {
        console.error('Error adding general setting:', error);
        throw new Error('Error adding general setting');
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['general_settings'],
      });
    },
  });
};

const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<Partial<GeneralSetting>, Error, Partial<GeneralSetting>>({
    mutationFn: async (setting) => {
      if (!setting.id) {
        throw new Error('Setting ID is required for update');
      }
      try {
        const docRef = doc(
          db,
          'general_settings',
          setting.id as string
        ).withConverter(generalSettingConverter);
        await updateDoc(docRef, setting);
        return setting;
      } catch (error) {
        console.error('Error updating general setting:', error);
        throw new Error('Error updating general setting');
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['general_settings'],
      });
    },
  });
};

const useDeleteSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, 'general_settings', id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general_settings'] });
    },
  });
};

const useGetSplitSettings = () => {
  return useQuery<SplitSetting[], Error>({
    queryKey: ['split_settings'],
    queryFn: async () => {
      try {
        const querySnapshot: QuerySnapshot<SplitSetting> = await getDocs(
          collection(db, 'split_settings').withConverter(splitSettingConverter)
        );

        return querySnapshot.docs.map((doc) => doc.data());
      } catch (error) {
        console.error('Error getting split settings:', error);
        throw new Error('Error getting split settings');
      }
    },
  });
};

const useAddSplitSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<Partial<SplitSetting>, Error, Partial<SplitSetting>>({
    mutationFn: async (setting) => {
      try {
        const docRef = await addDoc(
          collection(db, 'split_settings').withConverter(splitSettingConverter),
          setting
        );
        return { id: docRef.id, ...setting };
      } catch (error) {
        console.error('Error adding general setting:', error);
        throw new Error('Error adding general setting');
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['split_settings'],
      });
    },
  });
};

const useUpdateSplitSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<Partial<SplitSetting>, Error, Partial<SplitSetting>>({
    mutationFn: async (setting) => {
      if (!setting.id) {
        throw new Error('Setting ID is required for update');
      }
      try {
        const docRef = doc(
          db,
          'general_settings',
          setting.id as string
        ).withConverter(splitSettingConverter);
        await updateDoc(docRef, setting);
        return setting;
      } catch (error) {
        console.error('Error updating general setting:', error);
        throw new Error('Error updating general setting');
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['split_settings'],
      });
    },
  });
};

const useDeleteSplitSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: async (id) => {
      if (!id) {
        throw new Error('Setting ID is required for delete');
      }
      await deleteDoc(doc(db, 'general_settings', id));
      return id;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['split_settings'],
      });
    },
  });
};

export {
  useGetSettings,
  useAddSetting,
  useUpdateSetting,
  useGetSetting,
  useGetSplitSettings,
  useAddSplitSetting,
  useUpdateSplitSetting,
  useDeleteSplitSetting,
  useDeleteSetting,
  useGetSettingByName,
  useGetThemeFromLocalStorage,
  useSetThemeToLocalStorage,
};

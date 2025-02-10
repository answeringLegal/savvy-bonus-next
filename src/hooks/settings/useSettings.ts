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
import { useGetOwners } from '../useHubspot';

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

const useInitUsers = () => {
  const qureryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // fetch users from the API
      const data = [
        {
          hubspot: {
            name: 'James Chmela',
            id: 335828680,
            meta: {
              firstName: 'James',
              lastName: 'Chmela',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Fidel Diaz',
            id: 1562839052,
            meta: {
              firstName: 'Fidel',
              lastName: 'Diaz',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Francis Estivo',
            id: 145754767,
            meta: {
              firstName: 'Francis',
              lastName: 'Estivo',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Chris Ferguson',
            id: 91685705,
            meta: {
              firstName: 'Chris',
              lastName: 'Ferguson',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Anthony Novellino',
            id: 703142623,
            meta: {
              firstName: 'Anthony',
              lastName: 'Novellino',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Steve Ortner',
            id: 2082880976,
            meta: {
              firstName: 'Steve',
              lastName: 'Ortner',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Evan Rasco',
            id: 1319706621,
            meta: {
              firstName: 'Evan',
              lastName: 'Rasco',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Troy Simonsen',
            id: 140067508,
            meta: {
              firstName: 'Troy',
              lastName: 'Simonsen',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Brendan Stevenson',
            id: 1694040075,
            meta: {
              firstName: 'Brendan',
              lastName: 'Stevenson',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Jeffry Victoriano',
            id: 1224584884,
            meta: {
              firstName: 'Jeffry',
              lastName: 'Victoriano',
              isSalesman: true,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Alyssa Accardi',
            id: 371774926,
            meta: {
              firstName: 'Alyssa',
              lastName: 'Accardi',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Brock Anderson',
            id: 48169113,
            meta: {
              firstName: 'Brock',
              lastName: 'Anderson',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Krisandra Aponte',
            id: 381905879,
            meta: {
              firstName: 'Krisandra',
              lastName: 'Aponte',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Bridgitta Chango',
            id: 1763025506,
            meta: {
              firstName: 'Bridgitta',
              lastName: 'Chango',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Stephany Dionicio',
            id: 1828539983,
            meta: {
              firstName: 'Stephany',
              lastName: 'Dionicio',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Allison Dolan',
            id: 169107611,
            meta: {
              firstName: 'Allison',
              lastName: 'Dolan',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Jennika Flynn',
            id: 1759717470,
            meta: {
              firstName: 'Jennika',
              lastName: 'Flynn',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Mike G',
            id: 900276212,
            meta: {
              firstName: 'Mike',
              lastName: 'G',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Joe Galotti',
            id: 173234136,
            meta: {
              firstName: 'Joe',
              lastName: 'Galotti',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Jake Goff',
            id: 1722684459,
            meta: {
              firstName: 'Jake',
              lastName: 'Goff',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Tabitha Gray',
            id: 930362652,
            meta: {
              firstName: 'Tabitha',
              lastName: 'Gray',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Bob Joseph',
            id: 1533929534,
            meta: {
              firstName: 'Bob',
              lastName: 'Joseph',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Debbie Klivansky',
            id: 1888315932,
            meta: {
              firstName: 'Debbie',
              lastName: 'Klivansky',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Cesia Orellana',
            id: 305194984,
            meta: {
              firstName: 'Cesia',
              lastName: 'Orellana',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Jessica Ozer',
            id: 902918816,
            meta: {
              firstName: 'Jessica',
              lastName: 'Ozer',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Tony Prieto',
            id: 274793723,
            meta: {
              firstName: 'Tony',
              lastName: 'Prieto',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Giselle Rodriguez',
            id: 1756531165,
            meta: {
              firstName: 'Giselle',
              lastName: 'Rodriguez',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Stephanie Rosado',
            id: 154516796,
            meta: {
              firstName: 'Stephanie',
              lastName: 'Rosado',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Ben Shatles',
            id: 246981299,
            meta: {
              firstName: 'Ben',
              lastName: 'Shatles',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Andrew Shatles',
            id: 1057769550,
            meta: {
              firstName: 'Andrew',
              lastName: 'Shatles',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Rob Shatles',
            id: 1131467678,
            meta: {
              firstName: 'Rob',
              lastName: 'Shatles',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Leah Stack',
            id: 1693372034,
            meta: {
              firstName: 'Leah',
              lastName: 'Stack',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Tyler Tarry',
            id: 795623751,
            meta: {
              firstName: 'Tyler',
              lastName: 'Tarry',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Dev Team',
            id: 76174254,
            meta: {
              firstName: 'Dev',
              lastName: 'Team',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Support Team',
            id: 1201413172,
            meta: {
              firstName: 'Support',
              lastName: 'Team',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Genesis Torres',
            id: 1847692118,
            meta: {
              firstName: 'Genesis',
              lastName: 'Torres',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Samantha Vevante',
            id: 1097003861,
            meta: {
              firstName: 'Samantha',
              lastName: 'Vevante',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Nick Werker',
            id: 2104170663,
            meta: {
              firstName: 'Nick',
              lastName: 'Werker',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
        {
          hubspot: {
            name: 'Christine Yandolli',
            id: 269985351,
            meta: {
              firstName: 'Christine',
              lastName: 'Yandolli',
              isSalesman: false,
            },
          },
          chargeover: {
            name: '',
            id: '',
            meta: {},
          },
        },
      ];

      // insert data into user collection
      for (const user of data) {
        await addDoc(collection(db, 'users'), user);
      }

      // fetch users from the database
      // compare and sync
    },
    onSuccess: () => {
      qureryClient.invalidateQueries({ queryKey: ['users'] });
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
  useInitUsers,
};

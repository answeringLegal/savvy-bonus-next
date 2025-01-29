import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface GeneralSetting {
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

export interface SplitSetting {
  ordinal: number;
  percentage: number;
  description: string;
}

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

const useGetSettings = () => {
  return useQuery<GeneralSetting[], Error>({
    queryKey: ['general_settings'],
    queryFn: async () => {
      const settings = localStorage.getItem(GENERAL_SETTINGS_DATABASE_KEY);
      if (!settings) {
        localStorage.setItem(
          GENERAL_SETTINGS_DATABASE_KEY,
          JSON.stringify(DEFAULT_GENERAl_SETTINGS)
        );
        return DEFAULT_GENERAl_SETTINGS;
      }

      // return the settings
      if (settings && settings.length === DEFAULT_GENERAl_SETTINGS.length) {
        return JSON.parse(settings);
      }

      // merge the difference between the two
      if (settings && settings.length !== DEFAULT_GENERAl_SETTINGS.length) {
        const parsedSettings = JSON.parse(settings);
        const newSettings = DEFAULT_GENERAl_SETTINGS.filter((setting) => {
          return !parsedSettings.find(
            (s: GeneralSetting) => s.name === setting.name
          );
        });

        localStorage.setItem(
          GENERAL_SETTINGS_DATABASE_KEY,
          JSON.stringify([...parsedSettings, ...newSettings])
        );

        return [...parsedSettings, ...newSettings];
      }
    },
  });
};

const useGetSetting = (name: string) => {
  return useQuery<GeneralSetting, Error>({
    queryKey: ['setting', name],
    queryFn: async () => {
      const settings = localStorage.getItem(GENERAL_SETTINGS_DATABASE_KEY);
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        return parsedSettings.find(
          (setting: GeneralSetting) => setting.name === name
        );
      }

      return DEFAULT_GENERAl_SETTINGS.find(
        (setting: GeneralSetting) => setting.name === name
      );
    },
  });
};

const useAddSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<Partial<GeneralSetting>, Error, Partial<GeneralSetting>>({
    mutationFn: async (setting) => {
      const settings = localStorage.getItem(GENERAL_SETTINGS_DATABASE_KEY);
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        // force unique setting names
        if (
          parsedSettings.find((s: GeneralSetting) => s.name === setting.name)
        ) {
          throw new Error('Setting already exists');
        }
        parsedSettings.push(setting);
        localStorage.setItem(
          GENERAL_SETTINGS_DATABASE_KEY,
          JSON.stringify(parsedSettings)
        );
        return setting;
      }

      localStorage.setItem(
        GENERAL_SETTINGS_DATABASE_KEY,
        JSON.stringify([setting])
      );
      return setting;
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
      const settings = localStorage.getItem(GENERAL_SETTINGS_DATABASE_KEY);
      if (settings) {
        const parsedSettings = JSON.parse(settings);

        const index = parsedSettings.findIndex(
          (s: GeneralSetting) => s.name === setting.name
        );
        parsedSettings[index] = setting;
        localStorage.setItem(
          GENERAL_SETTINGS_DATABASE_KEY,
          JSON.stringify(parsedSettings)
        );
        return setting;
      }

      return setting;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['general_settings'],
      });
    },
  });
};

const useGetSplitSettings = () => {
  return useQuery<SplitSetting[], Error>({
    queryKey: ['split_settings'],
    queryFn: async () => {
      const settings = localStorage.getItem(SPLIT_SETTINGS_KEY);
      if (!settings) {
        localStorage.setItem(
          SPLIT_SETTINGS_KEY,
          JSON.stringify(DEFAULT_SPLIT_SETTINGS)
        );
        return DEFAULT_SPLIT_SETTINGS;
      }

      // return the settings
      if (settings && settings.length === DEFAULT_SPLIT_SETTINGS.length) {
        return JSON.parse(settings);
      }

      // merge the difference between the two
      if (settings && settings.length !== DEFAULT_SPLIT_SETTINGS.length) {
        const parsedSettings = JSON.parse(settings);
        const newSettings = DEFAULT_SPLIT_SETTINGS.filter((setting) => {
          return !parsedSettings.find(
            (s: SplitSetting) => s.ordinal === setting.ordinal
          );
        });

        localStorage.setItem(
          SPLIT_SETTINGS_KEY,
          JSON.stringify([...parsedSettings, ...newSettings])
        );

        return [...parsedSettings, ...newSettings];
      }
    },
  });
};

const useAddSplitSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<Partial<SplitSetting>, Error, Partial<SplitSetting>>({
    mutationFn: async (setting) => {
      const settings = localStorage.getItem(SPLIT_SETTINGS_KEY);
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        // force unique setting names
        if (
          parsedSettings.find(
            (s: SplitSetting) => s.ordinal === setting.ordinal
          )
        ) {
          throw new Error('Setting already exists');
        }
        parsedSettings.push(setting);
        localStorage.setItem(
          SPLIT_SETTINGS_KEY,
          JSON.stringify(parsedSettings)
        );
        return setting;
      }

      localStorage.setItem(SPLIT_SETTINGS_KEY, JSON.stringify([setting]));
      return setting;
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
      const settings = localStorage.getItem(SPLIT_SETTINGS_KEY);
      if (settings) {
        const parsedSettings = JSON.parse(settings);

        const index = parsedSettings.findIndex(
          (s: SplitSetting) => s.ordinal === setting.ordinal
        );
        parsedSettings[index] = setting;
        localStorage.setItem(
          SPLIT_SETTINGS_KEY,
          JSON.stringify(parsedSettings)
        );
        return setting;
      }

      return setting;
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
  return useMutation<number, Error, number>({
    mutationFn: async (ordinal) => {
      const settings = localStorage.getItem(SPLIT_SETTINGS_KEY);
      if (settings) {
        const parsedSettings = JSON.parse(settings);

        const index = parsedSettings.findIndex(
          (s: SplitSetting) => s.ordinal === ordinal
        );
        parsedSettings.splice(index, 1);
        localStorage.setItem(
          SPLIT_SETTINGS_KEY,
          JSON.stringify(parsedSettings)
        );
        return ordinal;
      }

      return ordinal;
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
};

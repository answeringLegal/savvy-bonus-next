import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Setting {
  name: string;
  value: string;
  description?: string;
  data_type?: 'number' | 'string' | 'boolean' | 'date';
}

const useGetSettings = () => {
  return useQuery<Setting[], Error>({
    queryKey: ['general_settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
  });
};

const useGetSetting = (name: string) => {
  return useQuery<Setting, Error>({
    queryKey: ['setting', name],
    queryFn: async () => {
      const response = await fetch(`/api/settings/${name}`);
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },
  });
};

const useAddSetting = () => {
  const queryClient = useQueryClient();
  return useMutation<Setting, Error, Partial<Setting>>({
    mutationFn: async (setting) => {
      const response = await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(setting),
      });
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
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
  return useMutation<Setting, Error, Partial<Setting>>({
    mutationFn: async (setting) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(setting),
      });
      if (!response.ok) throw new Error('Error fetching data');
      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['general_settings'],
      });
    },
  });
};

export { useGetSettings, useAddSetting, useUpdateSetting, useGetSetting };

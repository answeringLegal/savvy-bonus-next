/*
  ========================================
  this file contains the hook that will be used to manage the local preferences of the user
  ========================================

  the users preferences will be stored in the local storage of the browser, and will be used to customize the user experience

  some of the preferences that will be stored are:
  - general:
    - theme: light, dark
    - language: en, es
    - currency: usd, eur, gbp
  - integrations:
    - show-account-balance: true, false
  

*/

'use client';

import { useEffect, useState } from 'react';
import useLocalstorageState from './useLocalStorage';

const LOCAL_PREFERENCES_KEY = 'local-preferences';

export type LocalPreferences = {
  general: {
    language: 'en' | 'es';
    currency: 'usd' | 'eur' | 'gbp';
  };
  integrations: {
    showBalance: boolean;
  };
  ui: {
    calendarView: 'grid' | 'list';
  };
  accounts: {
    showBalance: boolean;
  };
};

export const useLocalPreferences = () => {
  // const getLocalPreferences = (): LocalPreferences => {
  //   const preferences = localStorage.getItem(LOCAL_PREFERENCES_KEY);
  //   if (!preferences) {
  //     return {
  //       general: {
  //         language: 'en',
  //         currency: 'usd',
  //       },
  //       integrations: {
  //         showAccountBalance: true,
  //       },
  //       ui: {
  //         calendarView: 'grid',
  //       },
  //       accounts: {
  //         showBalance: true,
  //       },
  //     };
  //   }
  //   return JSON.parse(preferences);
  // };

  // const setLocalPreferences = (preferences: LocalPreferences) => {
  //   localStorage.setItem(LOCAL_PREFERENCES_KEY, JSON.stringify(preferences));
  // };

  // useEffect(() => {
  //   const preferences = getLocalPreferences();
  //   setLocalPreferences(preferences);
  // }, []);

  // return {
  //   getLocalPreferences,
  //   setLocalPreferences,
  // };

  return useLocalstorageState<LocalPreferences>(LOCAL_PREFERENCES_KEY, {
    general: {
      language: 'en',
      currency: 'usd',
    },
    integrations: {
      showBalance: false,
    },
    ui: {
      calendarView: 'grid',
    },
    accounts: {
      showBalance: true,
    },
  });
};

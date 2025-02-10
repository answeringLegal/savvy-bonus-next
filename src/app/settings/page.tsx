'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useGetSettings,
  useGetSplitSettings,
  useGetThemeFromLocalStorage,
  useSetThemeToLocalStorage,
  useUpdateSplitSetting,
} from '@/hooks/settings/useSettings';
import { cn } from '@/lib/utils';
import { SplitSetting } from '@/types/settings';
import { ChevronLeft, SaveIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import React from 'react';
import { SettingItem } from './components/setting-item';

export default function SettingsPage() {
  const { data } = useGetSettings();
  const { setTheme } = useTheme();
  const { data: theme } = useGetThemeFromLocalStorage();
  const { mutate: setThemeInLocalStorage } = useSetThemeToLocalStorage();

  const { data: splits } = useGetSplitSettings();
  const { mutateAsync: update } = useUpdateSplitSetting();
  // const [localSplits, setLocalSplits] = React.useState<SplitSetting[]>([]);

  const isSplitsInvalid =
    // all splits should add up to 1
    splits?.reduce((acc, curr) => acc + curr.percentage, 0) !== 1;

  return (
    <main className='overflow-y-auto h-[100dvh]'>
      <header className='flex items-center p-4'>
        <Link href='/'>
          <Button size={'icon'} variant={'outline'}>
            <ChevronLeft />
          </Button>
        </Link>
        <h1>Settings</h1>
      </header>
      <div className='container mx-auto'>
        <div className='border-b'></div>
        <h2 className='text-sm text-foreground/70 mt-8'>General</h2>
        <div className='flex flex-col gap-4 divide-y'>
          <div className={cn('grid grid-cols-4 gap-4 py-4')}>
            <div className='flex flex-col'>
              <label htmlFor='' className='font-bold text-sm'>
                Theme
              </label>
            </div>
            <div className='col-span-3'>
              <select
                className='border border-foreground/20 rounded-md p-2 text-sm'
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  setThemeInLocalStorage(e.target.value);
                }}
              >
                <option value='light'>Light</option>
                <option value='dark'>Dark</option>
                <option value='system'>Default</option>
              </select>
            </div>
          </div>
          {data?.map((setting) => (
            <SettingItem key={setting.name} setting={setting} />
          ))}
        </div>
        <div className='border-b'></div>
        <h2 className='text-sm text-foreground/70 mt-8'>Splits</h2>
        <div className='flex flex-col gap-4 divide-y'>
          {splits?.map((setting) => (
            <div key={setting.ordinal} className='grid grid-cols-4 gap-4 py-4'>
              <p>{setting.ordinal}</p>
              <SplitSettingInput setting={setting} />

              <p>{setting.description}</p>
            </div>
          ))}
          <div className='grid grid-cols-4 gap-4 py-4'>
            <div className='col-span-2'></div>
            <div>
              <span>Total: </span>
              <span
                className={cn(
                  'text-sm',
                  isSplitsInvalid ? 'text-destructive' : 'text-green-500'
                )}
              >
                {(splits?.reduce((acc, curr) => acc + curr.percentage, 0) ||
                  0) * 100}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

interface SplitSettingInputProps
  extends React.HTMLAttributes<HTMLInputElement> {
  setting: SplitSetting;
}

function SplitSettingInput({
  setting,

  ...props
}: SplitSettingInputProps) {
  const { mutateAsync: update } = useUpdateSplitSetting();
  const [change, setChange] = React.useState(setting.percentage);

  async function handleUpdateSetting() {
    const res = await update({ ...setting, percentage: change });
    console.log(res);
  }

  return (
    <div className='flex items-center gap-2'>
      <Input
        {...props}
        type='number'
        min={0}
        max={1}
        value={change}
        step='0.01'
        onChange={(e) => {
          setChange(parseFloat(e.target.value));
        }}
      />
      {change !== setting.percentage && (
        <Button
          className='ml-auto flex-shrink-0'
          size={'icon'}
          onClick={() => {
            console.log('update');
            handleUpdateSetting();
          }}
        >
          <SaveIcon />
        </Button>
      )}
      <p>{(change * 100).toFixed()}%</p>
    </div>
  );
}

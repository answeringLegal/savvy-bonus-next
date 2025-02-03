'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GeneralSetting,
  SplitSetting,
  useGetSettings,
  useGetSplitSettings,
  useUpdateSetting,
  useUpdateSplitSetting,
} from '@/hooks/settings/useSettings';
import { cn } from '@/lib/utils';
import { ChevronLeft, SaveIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import React from 'react';

export default function SettingsPage() {
  const { data } = useGetSettings();
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
                  isSplitsInvalid ? 'text-red-500' : 'text-green-500'
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

interface SettingItemProps extends React.HTMLAttributes<HTMLDivElement> {
  setting: GeneralSetting;
}
function SettingItem({ setting, ...props }: SettingItemProps) {
  return (
    <div
      {...props}
      className={cn('grid grid-cols-4 gap-4 py-4', props.className)}
    >
      <div className='flex flex-col'>
        <label htmlFor='' className='font-bold text-sm'>
          {setting.name}
        </label>
        <small className='text-foreground/70'>{setting.description}</small>
      </div>
      <div className='col-span-3'>
        <SettingInput setting={setting} />
      </div>
    </div>
  );
}
interface SettingInputProps
  extends React.HTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  setting: GeneralSetting;
}

function SettingInput({ setting, ...props }: SettingInputProps) {
  const { mutateAsync: update } = useUpdateSetting();
  const [change, setChange] = React.useState(setting.value);
  const { setTheme } = useTheme();

  async function handleThemeChange(theme: string) {
    setTheme(theme);

    const res = await update({ name: 'Theme', value: theme });
    console.log(res);
  }

  async function handleUpdateSetting() {
    const res = await update({ ...setting, value: change });
    console.log(res);
  }
  if (setting.name === 'Theme') {
    return (
      <>
        <select
          {...props}
          className='border border-foreground/20 rounded-md p-2 text-sm'
          defaultValue={setting.value}
          onChange={(e) => {
            setChange(e.target.value);
            handleThemeChange(e.target.value);
          }}
        >
          <option value='light'>Light</option>
          <option value='dark'>Dark</option>
          <option value='system'>Default</option>
        </select>
      </>
    );
  }
  return (
    <div className='flex items-center gap-2'>
      <Input
        {...props}
        type={setting.data_type === 'number' ? 'number' : 'text'}
        className='border border-foreground/20 rounded-md p-2 w-fit'
        defaultValue={setting.value}
        onChange={(e) => setChange(e.target.value)}
      />
      {change !== setting.value && (
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
    </div>
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

import { cn } from '@/lib/utils';
import { GeneralSetting } from '@/types/settings';
import React from 'react';
import { SettingInput } from './setting-input';

interface SettingItemProps extends React.HTMLAttributes<HTMLDivElement> {
  setting: GeneralSetting;
}
export function SettingItem({ setting, ...props }: SettingItemProps) {
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

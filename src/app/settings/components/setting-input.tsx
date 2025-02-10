import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateSetting } from '@/hooks/settings/useSettings';
import { GeneralSetting } from '@/types/settings';
import { SaveIcon } from 'lucide-react';
import React from 'react';

interface SettingInputProps
  extends React.HTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  setting: GeneralSetting;
}

export function SettingInput({ setting, ...props }: SettingInputProps) {
  const { mutateAsync: update } = useUpdateSetting();
  const [change, setChange] = React.useState(setting.value);

  async function handleUpdateSetting() {
    const res = await update({ ...setting, value: change });
    console.log(res);
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
            window.location.reload();
          }}
        >
          <SaveIcon />
        </Button>
      )}
    </div>
  );
}

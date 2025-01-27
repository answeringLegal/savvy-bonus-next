// 'use client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// import { cn } from '@/lib/utils';
// import { ChevronLeft, SaveIcon } from 'lucide-react';
// import { useTheme } from 'next-themes';
// import Link from 'next/link';
// import React from 'react';

// export default function SettingsPage() {
//   const data = [
//     {
//       name: 'Theme',
//       description: 'Change the theme of the application',
//       value: 'light',
//     },
//     {
//       name: 'Language',
//       description: 'Change the language of the application',
//       value: 'en',
//     },
//     {
//       name: 'Currency',
//       description: 'Change the currency of the application',
//       value: 'USD',
//     },
//   ];
//   return (
//     <main>
//       <header className='flex items-center p-4'>
//         <Link href='/'>
//           <Button size={'icon'} variant={'outline'}>
//             <ChevronLeft />
//           </Button>
//         </Link>
//         <h1>Settings</h1>
//       </header>
//       <div className='container mx-auto'>
//         <div className='border-b'></div>
//         <div className='flex flex-col gap-4 divide-y'>
//           {/* {isLoading ? (
//             <div>Loading...</div>
//           ) : isError ? (
//             <div>Error</div>
//           ) : (
//             data?.map((setting) => (
//               <SettingItem key={setting.id} setting={setting} />
//             ))
//           )} */}
//           {data?.map((setting) => (
//             <SettingItem key={setting.name} setting={setting} />
//           ))}
//         </div>
//       </div>
//     </main>
//   );
// }

// interface SettingItemProps extends React.HTMLAttributes<HTMLDivElement> {
//   setting: Setting;
// }
// function SettingItem({ setting, ...props }: SettingItemProps) {
//   return (
//     <div
//       {...props}
//       className={cn('grid grid-cols-4 gap-4 py-4', props.className)}
//     >
//       <div className='flex flex-col'>
//         <label htmlFor='' className='font-bold text-sm'>
//           {setting.name}
//         </label>
//         <small className='text-foreground/70'>{setting.description}</small>
//       </div>
//       <div className='col-span-3'>
//         <SettingInput setting={setting} />
//       </div>
//     </div>
//   );
// }
// interface SettingInputProps
//   extends React.HTMLAttributes<HTMLInputElement | HTMLSelectElement> {
//   setting: Setting;
// }

// function SettingInput({ setting, ...props }: SettingInputProps) {
//   function update(setting: Partial<Setting>) {
//     return fetch(`/api/settings/${setting.name}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(setting),
//     }).then((res) => res.json());
//   }
//   const [change, setChange] = React.useState(setting.value);
//   const { setTheme } = useTheme();

//   async function handleThemeChange(theme: string) {
//     setTheme(theme);

//     const res = await update({ name: 'Theme', value: theme });
//     console.log(res);
//   }

//   async function handleUpdateSetting() {
//     const res = await update({ name: setting.name, value: change });
//     console.log(res);
//   }
//   if (setting.name === 'Theme') {
//     return (
//       <>
//         <select
//           {...props}
//           className='border border-foreground/20 rounded-md p-2 text-sm'
//           defaultValue={setting.value}
//           onChange={(e) => {
//             setChange(e.target.value);
//             handleThemeChange(e.target.value);
//           }}
//         >
//           <option value='light'>Light</option>
//           <option value='dark'>Dark</option>
//           <option value='system'>Default</option>
//         </select>
//       </>
//     );
//   }
//   return (
//     <div className='flex items-center gap-2'>
//       <Input
//         {...props}
//         type={setting.data_type || 'text'}
//         className='border border-foreground/20 rounded-md p-2 w-fit'
//         defaultValue={setting.value}
//         onChange={(e) => setChange(e.target.value)}
//       />
//       {change !== setting.value && (
//         <Button
//           className='ml-auto flex-shrink-0'
//           size={'icon'}
//           onClick={() => {
//             console.log('update');
//             handleUpdateSetting();
//           }}
//         >
//           <SaveIcon />
//         </Button>
//       )}
//     </div>
//   );
// }

import React from 'react';

export default function SettingsPage() {
  return <div>SettingsPage</div>;
}

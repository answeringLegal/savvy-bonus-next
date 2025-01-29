import type { Metadata, Viewport } from 'next';
import { Mulish, Poppins, Lexend } from 'next/font/google';
import './globals.css';
import {
  getKindeServerSession,
  LoginLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/server';
import { Button } from '@/components/ui/button';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { config } from '@/site/config';
import Link from 'next/link';
import { CogIcon } from 'lucide-react';
import { BackgroundLines } from '@/components/layout-background';
import Image from 'next/image';
import { Logo } from '@/components/logo';

const font = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: config.name,
  description: config.description,
  icons: [
    { rel: 'icon', url: './apple-touch-icon.png' },
    { rel: 'apple-touch-icon', url: './apple-touch-icon.png' },
  ],
  appleWebApp: {
    statusBarStyle: 'black-translucent',
    title: config.name,
    capable: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'contain',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafd' },
    { media: '(prefers-color-scheme: dark)', color: '#020814' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = getKindeServerSession();

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={font.className}>
        <ReactQueryProvider>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            {!(await isAuthenticated()) ? (
              <main className='auth relative'>
                <Logo />
                <BackgroundLines className='flex  w-full flex-col px-4 -z-10 bg-background'>
                  <section className='auth-content-center p-8 rounded-3xl sm:w-[400px] w-full mx-auto mt-[calc(50vh-200px)] z-10 bg-accent/20 backdrop-blur-md border border-accent/200 text-center'>
                    <div className='text mb-16'>
                      <small>Welcome to </small>
                      <h2 className='text-4xl font-bold leading-10'>
                        {config.name}
                      </h2>
                      <p className='mt-2 text-sm text-foreground/70'>
                        {config.description}
                      </p>
                    </div>
                    <div className='mt-4 flex flex-col space-y-4'>
                      <LoginLink className='btn'>
                        <Button className='block w-full'>Login</Button>
                      </LoginLink>
                    </div>
                  </section>
                </BackgroundLines>
              </main>
            ) : (
              <main className='app flex h-[100dvh] flex-col overflow-y-hidden'>
                <div className='fixed bottom-4 right-4 z-50'>
                  <Link href='/settings'>
                    <Button variant='secondary' size={'icon'}>
                      <CogIcon className='size-4' />
                    </Button>
                  </Link>
                </div>
                <section className='app-content flex flex-col relative flex-1'>
                  {children}
                </section>
              </main>
            )}
            <Toaster richColors />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

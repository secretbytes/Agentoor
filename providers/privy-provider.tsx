'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cm5xo1iqo03o5y0mhmbnxnijo"
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url',
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
          showWalletUIs: false,
        },
        externalWallets: {
          solana: {
            wallets: [
              new PhantomWalletAdapter(),
              new SolflareWalletAdapter(),
            ],
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}


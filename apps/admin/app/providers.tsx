'use client';

import { ApolloProvider } from '@apollo/client';
import { useMemo, type ReactNode } from 'react';
import { createAdminApolloClient } from '@/lib/apollo';

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => createAdminApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

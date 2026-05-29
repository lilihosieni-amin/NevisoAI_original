'use client';

import { ApolloProvider } from '@apollo/client';
import { useMemo, type ReactNode } from 'react';
import { createApolloClient } from '@/lib/apollo';

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

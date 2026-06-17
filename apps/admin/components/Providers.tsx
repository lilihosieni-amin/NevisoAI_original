'use client';

import { ApolloProvider } from '@apollo/client';
import { getApolloClient } from '../lib/apollo-client';

/** Client-side providers (Apollo, admin token). */
export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={getApolloClient()}>{children}</ApolloProvider>;
}

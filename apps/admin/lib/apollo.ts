'use client';

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { mapErrorCode } from './error-map';
import { adminTokenStore } from './admin-token';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/graphql';

/** Attaches the admin access token (separate token space from the user app). */
const authLink = setContext((_, { headers }) => {
  const token = adminTokenStore.get();
  return {
    headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const code = (err.extensions?.code as string) ?? 'INTERNAL_ERROR';
      (operation.getContext().persianError ??= {})[code] = mapErrorCode(code);
    }
  }
  if (networkError) {
    operation.setContext({ persianError: { NETWORK_ERROR: mapErrorCode('NETWORK_ERROR') } });
  }
});

const httpLink = new HttpLink({ uri: API_URL, credentials: 'include' });

export function createAdminApolloClient(): ApolloClient<unknown> {
  return new ApolloClient({
    link: ApolloLink.from([authLink, errorLink, httpLink]),
    cache: new InMemoryCache(),
  });
}

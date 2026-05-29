'use client';

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { mapErrorCode } from './error-map';
import { tokenStore } from './token-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/graphql';

/** Attaches the in-memory user access token (ARD §7.1). */
const authLink = setContext((_, { headers }) => {
  const token = tokenStore.get();
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } };
});

/**
 * Single Apollo errorLink scaffold (ARD §16): every GraphQL/network error is
 * normalized to a stable `code` and a Persian message. UI surfaces consume
 * `error.code` / `error.persianMessage`; raw server messages are never shown.
 */
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

// `credentials: 'include'` so the HttpOnly refresh cookie rides along.
const httpLink = new HttpLink({ uri: API_URL, credentials: 'include' });

export function createApolloClient(): ApolloClient<unknown> {
  return new ApolloClient({
    link: ApolloLink.from([authLink, errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
    },
  });
}

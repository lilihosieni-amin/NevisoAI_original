import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
  type NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { toPersianMessage } from './error-map';
import { useAdminAuthStore } from './admin-auth';

const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:3000/graphql';

/** Same central error→Persian mapping as the user app (ARD §16.2). */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // eslint-disable-next-line no-console
      console.error('[graphql]', err.extensions?.code, '→', toPersianMessage(err.extensions?.code));
    }
  }
  if (networkError) {
    // eslint-disable-next-line no-console
    console.error('[network]', toPersianMessage('NETWORK_ERROR'));
  }
});

// Sends the ADMIN token — never the user token (ARD §7.4 isolation).
const authLink = setContext((_, { headers }) => {
  const token = useAdminAuthStore.getState().accessToken;
  return {
    headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
  };
});

const httpLink = new HttpLink({ uri: HTTP_ENDPOINT, credentials: 'include' });

let client: ApolloClient<NormalizedCacheObject> | null = null;

export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (!client) {
    client = new ApolloClient({
      link: from([errorLink, authLink, httpLink]),
      cache: new InMemoryCache(),
    });
  }
  return client;
}

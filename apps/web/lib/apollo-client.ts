import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  from,
  type NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { toPersianMessage } from './error-map';
import { useAuthStore } from './auth-store';

const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:3000/graphql';
const WS_ENDPOINT = HTTP_ENDPOINT.replace(/^http/, 'ws');

/**
 * Apollo `errorLink` — the single place GraphQL/network errors are turned into
 * Persian (ARD §16.2). Every error is mapped via `extensions.code`; unknown or
 * network errors fall back to a generic Persian message. The raw error is
 * logged, never shown.
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const persian = toPersianMessage(err.extensions?.code);
      // eslint-disable-next-line no-console
      console.error('[graphql]', err.extensions?.code, '→', persian);
    }
  }
  if (networkError) {
    // eslint-disable-next-line no-console
    console.error('[network]', toPersianMessage('NETWORK_ERROR'));
  }
});

const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
  };
});

const httpLink = new HttpLink({ uri: HTTP_ENDPOINT, credentials: 'include' });

function buildLink() {
  // WebSocket subscriptions only exist in the browser.
  if (typeof window === 'undefined') {
    return from([errorLink, authLink, httpLink]);
  }

  const wsLink = new GraphQLWsLink(
    createClient({
      url: WS_ENDPOINT,
      connectionParams: () => {
        const token = useAuthStore.getState().accessToken;
        return token ? { authToken: token } : {};
      },
    }),
  );

  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    wsLink,
    httpLink,
  );

  return from([errorLink, authLink, splitLink]);
}

let client: ApolloClient<NormalizedCacheObject> | null = null;

export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (!client) {
    client = new ApolloClient({
      link: buildLink(),
      cache: new InMemoryCache(),
    });
  }
  return client;
}

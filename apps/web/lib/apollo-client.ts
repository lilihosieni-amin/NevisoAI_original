import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  Observable,
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

// Operations that must never trigger a silent refresh (they ARE the auth flow,
// or are unauthenticated by design) — retrying them would loop.
const NO_REFRESH_OPS = new Set([
  'RefreshToken',
  'Login',
  'VerifyOtp',
  'RequestOtp',
  'OtpChannels',
  'Logout',
]);

let refreshing: Promise<string | null> | null = null;

/**
 * Exchange the HttpOnly refresh cookie for a new access token (ARD §7.1).
 * De-duplicated: concurrent callers share one in-flight request. Returns null
 * when there is no valid session.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await fetch(HTTP_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: 'mutation { refreshToken { accessToken } }' }),
      });
      const json = (await res.json()) as { data?: { refreshToken?: { accessToken?: string } } };
      const token = json?.data?.refreshToken?.accessToken ?? null;
      useAuthStore.getState().setAccessToken(token);
      return token;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/**
 * Apollo `errorLink` — maps every error to Persian for logging (ARD §16.2) and,
 * on `UNAUTHENTICATED`, silently refreshes the access token once and retries
 * the original operation.
 */
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    const needsRefresh =
      !NO_REFRESH_OPS.has(operation.operationName) &&
      graphQLErrors.some((e) => e.extensions?.code === 'UNAUTHENTICATED');

    for (const err of graphQLErrors) {
      // eslint-disable-next-line no-console
      console.error('[graphql]', err.extensions?.code, '→', toPersianMessage(err.extensions?.code));
    }

    if (needsRefresh) {
      return new Observable((observer) => {
        refreshAccessToken()
          .then((token) => {
            if (!token) {
              observer.error(new Error('UNAUTHENTICATED'));
              return;
            }
            const headers = operation.getContext().headers as Record<string, string> | undefined;
            operation.setContext({ headers: { ...headers, authorization: `Bearer ${token}` } });
            forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          })
          .catch((e) => observer.error(e));
      });
    }
  }
  if (networkError) {
    // eslint-disable-next-line no-console
    console.error('[network]', toPersianMessage('NETWORK_ERROR'));
  }
  return undefined;
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

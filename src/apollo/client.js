import ApolloClient from 'apollo-boost';
import fetch from 'isomorphic-fetch';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';

const cache = new InMemoryCache({});

if (typeof window !== 'undefined') {
  persistCache({
    cache,
    storage: window.localStorage,
  });
}

export const client = new ApolloClient({
  cache,
  uri: 'http://localhost:4001/graphql',
  fetch,
  clientState: {
    defaults: {
      something: { __typename: 'Something', value: 'Cool' },
    },
    resolvers: {},
  },
});

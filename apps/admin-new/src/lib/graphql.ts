// NOTE: remove the line below before editing this file
/* eslint-disable */

// import {
//   ApolloClient,
//   InMemoryCache,
//   ApolloProvider,
//   gql,
// } from "@apollo/client";
// import { BACKEND_URL } from "./router";

// export const client = new ApolloClient({
//   uri: `${BACKEND_URL}/graphql`,
//   cache: new InMemoryCache(),
//   credentials: "include",
// });

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
} from "@apollo/client";
import { getSession } from "next-auth/react";
import { BACKEND_URL } from "./router";

// Function to retrieve token
const getToken = async () => {
  // Your logic to retrieve the token
  const session = await getSession();
  return session ? (session as any).accessToken : null;
};

// HTTP connection to the GraphQL API
const httpLink = new HttpLink({ uri: `${BACKEND_URL}/graphql` });

// Middleware to handle auth token
// @ts-ignore
const authLink = new ApolloLink(async (operation: any, forward: any) => {
  return await getToken().then((token) => {
    operation.setContext({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return forward(operation);
  });
});

// Create the Apollo Client instance
export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

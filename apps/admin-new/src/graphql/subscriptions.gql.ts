import { gql } from "@apollo/client";

export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions {
    getSubscriptions {
      id
      status
      createdAt
      updatedAt
      user {
        id
        email
      }
      plan {
        name
      }
      package {
        name
      }
    }
  }
`;

export const FAIL_SUBSCRIPTION = gql`
  mutation FailSubscription($subscriptionId: Int!) {
    failSubscription(subscriptionId: $subscriptionId) {
      id
      status
      plan {
        name
      }
      user {
        id
        email
      }
    }
  }
`;

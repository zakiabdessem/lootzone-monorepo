import { gql } from "@apollo/client";

export const GET_PAYMENTS = gql`
  query GetPayments {
    getPayments {
      id
      amount
      status
      method
      proofUrl
      createdAt
      user {
        id
        email
      }
      company {
        name
      }
    }
  }
`;

export const VALIDATE_PAYMENT = gql`
  mutation ValidatePayment($paymentId: Int!) {
    validatePayment(paymentId: $paymentId) {
      id
      status
    }
  }
`;

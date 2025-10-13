import gql from "graphql-tag";

export const GET_USER = gql`
  query UserMe {
    userMe {
      id
      firstname
      lastname
      email
      
      phone
      role
    }
  }
`;

export const GET_USERS = gql`
  query Users {
    users {
      id
      firstname
      lastname
      email
      
      phone
      status
      role
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginUserInput: { email: $email, password: $password }) {
      accessToken
      user {
        email
        role
      }
    }
  }
`;

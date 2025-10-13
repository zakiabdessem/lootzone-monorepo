import { gql } from "graphql-tag";

export const GET_PARTICIPANTS_BY_STATUS_QUERY = gql`
  query GetParticipants($status: String!) {
    participantsByStatus(participant_status: $status) {
      _id
      email
      contactNumber
      discordUsername
      name
      tShirtSize
      checkInDates
      status
      teamName
      linkedin
      portfolio
    }
  }
`;

export const GET_PARTICIPANTS_BY_QUERY = gql`
  query GetParticipants($query: String!) {
    participants(query: $query) {
      _id
      email
      contactNumber
      discordUsername
      name
      tShirtSize
      checkInDates
      status
      teamName
      linkedin
      portfolio
    }
  }
`;

import { gql } from "graphql-tag";

export const GET_TEAMS_QUERY = gql`
  query GetTeam {
    teams {
      _id
      name
      username
      password
      points {
        points
        challengeId
        submission_link
      }
      submission_link
      teamMembers {
        _id
        email
        discordUsername
        name
        contactNumber
      }
      total_points
    }
  }
`;

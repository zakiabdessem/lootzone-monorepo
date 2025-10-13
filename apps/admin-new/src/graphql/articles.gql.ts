import { gql } from "@apollo/client";

export const GET_ADMIN_ARTICLES = gql`
  query AdminArticles {
    adminArticles {
      id
      subject
      isPublished
      featuredImage
      publishedAt
    }
  }
`;

export const SET_ARTICLE_PUBLISH_STATUS = gql`
  mutation SetArticlePublishStatus($id: Int!, $publish: Boolean!) {
    setArticlePublishStatus(id: $id, publish: $publish) {
      id
      isPublished
      publishedAt
    }
  }
`; 
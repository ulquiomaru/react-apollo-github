import React from 'react';
import { gql, useQuery } from '@apollo/client';

import RepositoryList from '../Repository';
import Loading from '../Loading';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  {
    viewer {
      repositories(first: 5, orderBy: { direction: DESC, field: STARGAZERS }) {
        edges {
          node {
            id
            name
            url
            descriptionHTML
            primaryLanguage {
              name
            }
            owner {
              login
              url
            }
            stargazers {
              totalCount
            }
            viewerHasStarred
            watchers {
              totalCount
            }
            viewerSubscription
          }
        }
      }
    }
  }
`;

function Profile() {
  const { loading, error, data } = useQuery(GET_REPOSITORIES_OF_CURRENT_USER);

  if (loading) return <Loading />;
  if (error) return <p>:( Error! {error.message}</p>;

  return <RepositoryList repositories={data.viewer.repositories} />;
}

export default Profile;

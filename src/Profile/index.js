import React from 'react';
import { gql, useQuery } from '@apollo/client';

import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';
import Loading from '../Loading';
import ErrorMessage from '../Error';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  {
    viewer {
      repositories(first: 5, orderBy: { direction: DESC, field: STARGAZERS }) {
        edges {
          node {
            ...repository
          }
        }
      }
    }
  }

  ${REPOSITORY_FRAGMENT}
`;

function Profile() {
  const { loading, error, data } = useQuery(GET_REPOSITORIES_OF_CURRENT_USER);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return <RepositoryList repositories={data.viewer.repositories} />;
}

export default Profile;

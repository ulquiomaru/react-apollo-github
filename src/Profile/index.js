import React from 'react';
import { gql, useQuery } from '@apollo/client';

import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';
import Loading from '../Loading';
import ErrorMessage from '../Error';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  query($cursor: String) {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
        after: $cursor
      ) {
        edges {
          node {
            ...repository
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }

  ${REPOSITORY_FRAGMENT}
`;

function Profile() {
  const { data, loading, error, fetchMore } = useQuery(
    GET_REPOSITORIES_OF_CURRENT_USER,
    {
      notifyOnNetworkStatusChange: true,
    },
  );

  if (error) return <ErrorMessage error={error} />;
  if (loading && !data?.viewer) return <Loading />;

  return (
    <RepositoryList
      repositories={data.viewer.repositories}
      loading={loading}
      fetchMore={fetchMore}
      entry={'viewer'}
    />
  );
}

export default Profile;

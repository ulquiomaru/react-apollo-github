import React from 'react';
import { gql, useQuery } from '@apollo/client';

import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';
import Loading from '../Loading';
import ErrorMessage from '../Error';

const GET_REPOSITORIES_OF_ORGANIZATION = gql`
  query($organizationName: String!, $cursor: String) {
    organization(login: $organizationName) {
      repositories(first: 5, after: $cursor) {
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

const Organization = ({ organizationName }) => {
  const { data, loading, error, fetchMore } = useQuery(
    GET_REPOSITORIES_OF_ORGANIZATION,
    {
      variables: {
        organizationName,
      },
      skip: organizationName === '',
      notifyOnNetworkStatusChange: true,
    },
  );

  if (error) return <ErrorMessage error={error} />;
  if (loading && !data?.organization) return <Loading />;

  return (
    <RepositoryList
      repositories={data.organization.repositories}
      loading={loading}
      fetchMore={fetchMore}
      entry={'organization'}
    />
  );
};

export default Organization;

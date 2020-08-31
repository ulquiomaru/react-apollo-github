import React from 'react';
import { gql, useQuery } from '@apollo/client';

import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';

import './style.css';

const GET_ISSUES_OF_REPOSITORY = gql`
  query($repositoryOwner: String!, $repositoryName: String!) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5) {
        edges {
          node {
            id
            number
            state
            title
            url
            bodyHTML
          }
        }
      }
    }
  }
`;

const IssueList = ({ issues }) => (
  <div className="IssueList">
    {issues.edges.map(({ node }) => (
      <IssueItem key={node.id} issue={node} />
    ))}
  </div>
);

const Issues = ({ repositoryOwner, repositoryName }) => {
  const { data, loading, error } = useQuery(GET_ISSUES_OF_REPOSITORY, {
    variables: {
      repositoryOwner,
      repositoryName,
    },
  });

  if (error) return <ErrorMessage error={error} />;
  if (loading && !data?.repository) return <Loading />;

  if (!data.repository.issues.edges.length) {
    return <div className="IssueList">No issues ...</div>;
  }

  return <IssueList issues={data.repository.issues} />;
};

export default Issues;

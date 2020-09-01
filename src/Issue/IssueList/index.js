import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

import IssueItem from '../IssueItem';
import FetchMore from '../../FetchMore';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import { ButtonUnobtrusive } from '../../Button';

import './style.css';

const ISSUE_STATES = {
  NONE: 'NONE',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

const TRANSITION_LABELS = {
  [ISSUE_STATES.NONE]: 'Show Open Issues',
  [ISSUE_STATES.OPEN]: 'Show Closed Issues',
  [ISSUE_STATES.CLOSED]: 'Hide Issues',
};

const TRANSITION_STATE = {
  [ISSUE_STATES.NONE]: ISSUE_STATES.OPEN,
  [ISSUE_STATES.OPEN]: ISSUE_STATES.CLOSED,
  [ISSUE_STATES.CLOSED]: ISSUE_STATES.NONE,
};

const isShow = (issueState) => issueState !== ISSUE_STATES.NONE;

const updateQuery = (previousResult, { fetchMoreResult }) => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  return {
    ...previousResult,
    repository: {
      ...previousResult.repository,
      issues: {
        ...previousResult.repository.issues,
        ...fetchMoreResult.repository.issues,
        edges: [
          ...previousResult.repository.issues.edges,
          ...fetchMoreResult.repository.issues.edges,
        ],
      },
    },
  };
};

const GET_ISSUES_OF_REPOSITORY = gql`
  query(
    $repositoryOwner: String!
    $repositoryName: String!
    $issueState: IssueState!
    $cursor: String
  ) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5, states: [$issueState], after: $cursor) {
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
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

const IssueList = ({
  issues,
  loading,
  fetchMore,
  repositoryOwner,
  repositoryName,
  issueState,
}) => (
  <>
    <div className="IssueList">
      {issues.edges.map(({ node }) => (
        <IssueItem key={node.id} issue={node} />
      ))}
    </div>

    <FetchMore
      loading={loading}
      hasNextPage={issues.pageInfo.hasNextPage}
      variables={{
        repositoryOwner,
        repositoryName,
        issueState,
        cursor: issues.pageInfo.endCursor,
      }}
      updateQuery={updateQuery}
      fetchMore={fetchMore}
    >
      Issues
    </FetchMore>
  </>
);

const Issues = ({ repositoryOwner, repositoryName }) => {
  const [issueState, setIssueState] = useState(ISSUE_STATES.NONE);

  const { data, loading, error, fetchMore } = useQuery(
    GET_ISSUES_OF_REPOSITORY,
    {
      variables: {
        repositoryOwner,
        repositoryName,
        issueState,
      },
      skip: !isShow(issueState),
      notifyOnNetworkStatusChange: true,
    },
  );

  const getIssueContent = () => {
    if (error) return <ErrorMessage error={error} />;

    if (loading && !data?.repository) return <Loading />;

    if (!data.repository.issues.edges.length) {
      return <div className="IssueList">No issues ...</div>;
    }

    return (
      <IssueList
        issues={data.repository.issues}
        loading={loading}
        fetchMore={fetchMore}
        repositoryOwner={repositoryOwner}
        repositoryName={repositoryName}
        issueState={issueState}
      />
    );
  };

  return (
    <div className="Issues">
      <ButtonUnobtrusive
        onClick={() => setIssueState(TRANSITION_STATE[issueState])}
      >
        {TRANSITION_LABELS[issueState]}
      </ButtonUnobtrusive>

      {isShow(issueState) && getIssueContent()}
    </div>
  );
};

export default Issues;

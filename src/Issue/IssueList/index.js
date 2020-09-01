import React, { useState } from 'react';
import { gql, useQuery, useApolloClient, ApolloConsumer } from '@apollo/client';

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

  const { data, loading, error, fetchMore, client } = useQuery(
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
      <IssueFilter
        issueState={issueState}
        setIssueState={setIssueState}
        repositoryOwner={repositoryOwner}
        repositoryName={repositoryName}
        client={client}
      />

      {isShow(issueState) && getIssueContent()}
    </div>
  );
};

const prefetchIssues = ({
  client,
  issueState,
  repositoryOwner,
  repositoryName,
}) => {
  const nextIssueState = TRANSITION_STATE[issueState];

  if (isShow(nextIssueState)) {
    client.query({
      query: GET_ISSUES_OF_REPOSITORY,
      variables: {
        issueState: nextIssueState,
        repositoryOwner,
        repositoryName,
      },
    });
  }
};

const IssueFilter = ({
  issueState,
  setIssueState,
  repositoryOwner,
  repositoryName,
  client,
}) => {
  // const client = useApolloClient();

  // return (
  //   <ApolloConsumer>
  //     {(client) => (
  //       <ButtonUnobtrusive
  //         onClick={() => setIssueState(TRANSITION_STATE[issueState])}
  //         onMouseOver={() =>
  //           prefetchIssues(client, issueState, repositoryOwner, repositoryName)
  //         }
  //       >
  //         {TRANSITION_LABELS[issueState]}
  //       </ButtonUnobtrusive>
  //     )}
  //   </ApolloConsumer>
  // );

  return (
    <ButtonUnobtrusive
      onClick={() => setIssueState(TRANSITION_STATE[issueState])}
      onMouseOver={() =>
        prefetchIssues(client, issueState, repositoryOwner, repositoryName)
      }
    >
      {TRANSITION_LABELS[issueState]}
    </ButtonUnobtrusive>
  );
};

export default Issues;

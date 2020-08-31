import React from 'react';
import { useMutation } from '@apollo/client';

import REPOSITORY_FRAGMENT from '../fragments';
import Link from '../../Link';
import Button from '../../Button';

import '../style.css';

import {
  STAR_REPOSITORY,
  UNSTAR_REPOSITORY,
  WATCH_REPOSITORY,
} from '../mutations';

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = (viewerSubscription) =>
  viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

const updateWatch = (
  client,
  {
    data: {
      updateSubscription: {
        subscribable: { id, viewerSubscription },
      },
    },
  },
) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });

  let totalCount = repository.watchers.totalCount;
  totalCount = isWatch(viewerSubscription) ? totalCount + 1 : totalCount - 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      watchers: {
        ...repository.watchers,
        totalCount,
      },
    },
  });
};

const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred,
}) => {
  const [addStar] = useMutation(STAR_REPOSITORY, { variables: { id } });
  const [removeStar] = useMutation(UNSTAR_REPOSITORY, { variables: { id } });
  const [updateSubscription] = useMutation(WATCH_REPOSITORY, {
    variables: {
      id,
      viewerSubscription: isWatch(viewerSubscription)
        ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
        : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
    },
    update: updateWatch,
  });

  return (
    <div>
      <div className="RepositoryItem-title">
        <h2>
          <Link href={url}>{name}</Link>
        </h2>

        <div>
          <Button
            className="RepositoryItem-title-action"
            onClick={() => updateSubscription()}
          >
            {watchers.totalCount}{' '}
            {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
          </Button>
          <Button
            className="RepositoryItem-title-action"
            onClick={() => (viewerHasStarred ? removeStar() : addStar())}
          >
            {stargazers.totalCount} {viewerHasStarred ? 'Unstar' : 'Star'}
          </Button>
        </div>
      </div>

      <div className="RepositoryItem-description">
        <div
          className="RepositoryItem-description-info"
          dangerouslySetInnerHTML={{ __html: descriptionHTML }}
        />
        <div className="RepositoryItem-description-details">
          <div>
            {primaryLanguage && <span>Language: {primaryLanguage.name}</span>}
          </div>
          <div>
            {owner && (
              <span>
                Owner: <a href={owner.url}>{owner.login}</a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryItem;

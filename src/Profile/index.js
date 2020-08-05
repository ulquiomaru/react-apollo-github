import React from 'react';
import { gql, useQuery } from '@apollo/client';

import Loading from '../Loading';

const GET_CURRENT_USER = gql`
  {
    viewer {
      login
      name
    }
  }
`;

function Profile() {
  const { loading, error, data } = useQuery(GET_CURRENT_USER);

  if (loading) return <Loading />;
  if (error) return <p>:( Error! {error.message}</p>;

  const { viewer } = data;

  return (
    <div>
      {viewer.name} {viewer.login}
    </div>
  );
}

export default Profile;

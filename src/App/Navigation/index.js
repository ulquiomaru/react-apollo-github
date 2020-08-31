import React, { useState } from 'react';
import { Link, withRouter } from 'react-router-dom';

import * as routes from '../../constants/routes';

import Button from '../../Button';
import Input from '../../Input';

import './style.css';

const Navigation = ({
  location: { pathname },
  organizationName,
  onOrganizationSearch,
}) => {
  return (
    <header className="Navigation">
      <div className="Navigation-link">
        <Link to={routes.PROFILE}>Profile</Link>
      </div>
      <div className="Navigation-link">
        <Link to={routes.ORGANIZATION}>Organization</Link>
      </div>

      {pathname === routes.ORGANIZATION && (
        <OrganizationSearch
          organizationName={organizationName}
          onOrganizationSearch={onOrganizationSearch}
        />
      )}
    </header>
  );
};

const OrganizationSearch = ({ organizationName, onOrganizationSearch }) => {
  const [value, setValue] = useState(organizationName);

  const onChange = (event) => {
    setValue(event.target.value);
  };

  const onSubmit = (event) => {
    onOrganizationSearch(value);

    event.preventDefault();
  };

  return (
    <div className="Navigation-search">
      <form onSubmit={onSubmit}>
        <Input color={'white'} type="text" value={value} onChange={onChange} />{' '}
        <Button color={'white'} type="submit">
          Search
        </Button>
      </form>
    </div>
  );
};

export default withRouter(Navigation);

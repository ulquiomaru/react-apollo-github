import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from './Navigation';
import Organization from '../Organization';
import Profile from '../Profile';

import * as routes from '../constants/routes';

import './style.css';

const App = () => (
  <Router>
    <div className="App">
      <Navigation />
      <div className="App-main">
        <Route
          exact
          path={routes.ORGANIZATION}
          component={() => (
            <div className="App-content_large-header">
              <Organization organizationName={'the-road-to-learn-react'} />
            </div>
          )}
        />
        <Route
          exact
          path={routes.PROFILE}
          component={() => (
            <div className="App-content_small-header">
              <Profile />
            </div>
          )}
        />
      </div>
    </div>
  </Router>
);

export default App;

import React from 'react';
import { Provider } from 'react-redux';

import store from '../store';

import AppFrame from './AppFrame.jsx';

export default (
  <Provider store={store}>
    <AppFrame />
  </Provider>
);

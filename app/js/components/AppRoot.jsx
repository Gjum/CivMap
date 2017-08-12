import React from 'react';
import { Provider } from 'react-redux';

import store from '../store';

import LocalStorageSync from './LocalStorageSync.jsx';
import AppFrame from './AppFrame.jsx';

const CivMapApp = () => (
  <div className='full'>
    <LocalStorageSync />
    <AppFrame />
  </div>
);

export default (
  <Provider store={store}>
    <CivMapApp />
  </Provider>
);

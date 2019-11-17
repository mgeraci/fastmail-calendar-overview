/* global document */

import React from 'react';
import { render } from 'react-dom';

import BrowserStorage from '../browserStorage';

import App from './App';

import './index.scss';

const FastmailCalendarOverviewOptions = {
  hasStorageGetError: false,

  init() {
    const storage = new BrowserStorage();

    /* eslint-disable react/jsx-filename-extension */
    render(
      <App storage={storage} />,
      document.getElementById('root'),
    );
    /* eslint-enable react/jsx-filename-extension */
  },
};

document.addEventListener(
  'DOMContentLoaded',
  FastmailCalendarOverviewOptions.init.bind(FastmailCalendarOverviewOptions),
);

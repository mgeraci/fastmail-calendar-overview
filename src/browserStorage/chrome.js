/* global chrome */

import {
  STORAGE_KEY,
  STORAGE_DEFAULT,
  STORAGE_SUCCESS,
} from './util/constants';

export default {
  get() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get({
        [STORAGE_KEY]: STORAGE_DEFAULT,
      }, (res) => {
        if (chrome.runtime.lastError) {
          let error = 'storage.get failure.';

          if (chrome.runtime.lastError.message) {
            error = `${error} ${chrome.runtime.lastError.message}`;
          }

          reject(new Error(error));
          return;
        }

        resolve(res[STORAGE_KEY]);
      });
    });
  },

  set(data) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({
        [STORAGE_KEY]: data,
      }, () => {
        if (chrome.runtime.lastError) {
          let error = 'storage.set failure.';

          if (chrome.runtime.lastError.message) {
            error = `${error} ${chrome.runtime.lastError.message}`;
          }

          reject(new Error(error));
          return;
        }

        resolve(STORAGE_SUCCESS);
      });
    });
  },
};

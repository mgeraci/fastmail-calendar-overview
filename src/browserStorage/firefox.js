/* global browser */

import {
  STORAGE_KEY,
  STORAGE_DEFAULT,
  STORAGE_SUCCESS,
} from './util/constants';

export default {
  get() {
    return new Promise((resolve, reject) => {
      browser.storage.sync.get({
        [STORAGE_KEY]: STORAGE_DEFAULT,
      }, (res) => {
        if (browser.runtime.lastError) {
          let error = 'storage.get failure.';

          if (browser.runtime.lastError.message) {
            error = `${error} ${browser.runtime.lastError.message}`;
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
      browser.storage.sync.set({
        [STORAGE_KEY]: data,
      }, () => {
        if (browser.runtime.lastError) {
          let error = 'storage.set failure.';

          if (browser.runtime.lastError.message) {
            error = `${error} ${browser.runtime.lastError.message}`;
          }

          reject(new Error(error));
          return;
        }

        resolve(STORAGE_SUCCESS);
      });
    });
  },
};

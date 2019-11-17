/* global browser, chrome */

import ChromeBrowserStorage from './chrome';
import FirefoxBrowserStorage from './firefox';
import DefaultBrowserStorage from './default';

class BrowserStorage {
  constructor() {
    let res;

    if (typeof browser !== 'undefined' && browser.storage) {
      res = FirefoxBrowserStorage;
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      res = ChromeBrowserStorage;
    } else {
      res = DefaultBrowserStorage;
    }

    this.storage = res;
  }

  get() {
    return this.storage.get();
  }

  set(data) {
    return this.storage.set(data);
  }
}

export default BrowserStorage;

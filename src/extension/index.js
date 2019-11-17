/* global window, document, fetch */

import {
  FASTMAIL_ROOT_DIV,
  TARGET_DIV,
  LAST_FASTMAIL_ELEMENT,
  WRAPPER_ID,
  MAX_HEIGHT,
  MIN_HEIGHT,
  REFRESH_INTERVAL,
  FETCH_STATUSES,
  THEMES,
} from './util/constants';

import rgbToHsl from './util/rgbToHsl';

import BrowserStorage from '../browserStorage';
import vCalendar from './vCalendar';
import Templates from './templates';

import './index.scss';

const FastmailCalendarOverview = {
  init() {
    const storage = new BrowserStorage();

    // get the user's calendars from browser storage, then run the rest of the
    // script
    storage.get().then((res) => {
      console.log('Fastmail Calendar Overview, calendars:', res); // eslint-disable-line

      this.calendars = res;
      this.run();
      this.startInterval();
    }).catch((err) => {
      console.error('Fastmail Calendar Overview failed to load calendars from storage:', err); // eslint-disable-line
    });

    window.addEventListener('resize', this.sizeWrapper.bind(this));
  },

  // fetch, parse, and display the calendar data
  run() {
    this.fetchCalendars()
      .then((data) => this.parseResults(data))
      .then((data) => this.addMarkup(data));
  },

  // set an interal to keep the calendar data up to date
  startInterval() {
    this.calendarTimer = setInterval(
      this.run.bind(this),
      REFRESH_INTERVAL,
    );
  },

  /**
   * Get calendar data, gracefully handling non-200 codes.
   * @return {Array} res - an array of calendar results
   * @return {Object} res[] - a calendar result
   * @return {string} res[].name - the calendar's name
   * @return {string} res[].status - a success or failure flag
   * @return {any} res[].data - the returned data
   */
  fetchCalendars() {
    const results = [];

    return new Promise((resolve) => {
      this.calendars.forEach((calendar) => {
        fetch(calendar.url)
          .then((res) => {
            if (res.status === 200) {
              return res;
            }

            throw new Error(`Calendar ${calendar.name} returned status code ${res.status}`);
          })
          .then((res) => res.text())
          .then((res) => {
            results.push({
              name: calendar.name,
              status: FETCH_STATUSES.success,
              data: res,
            });

            if (results.length === this.calendars.length) {
              resolve(results);
            }
          })
          .catch((err) => {
            results.push({
              name: calendar.name,
              status: FETCH_STATUSES.error,
              data: err,
            });

            if (results.length === this.calendars.length) {
              resolve(results);
            }
          });
      });
    });
  },

  parseResults(results) {
    let events = [];

    results.forEach((result) => {
      if (result.status === FETCH_STATUSES.error) {
        console.error(`Fastmail Calendar Overview got an error fetching ${result.name}: ${result.data}`); // eslint-disable-line
        return;
      }

      const parsedEvents = vCalendar.parse(result.data, result.name);
      events = events.concat(parsedEvents);
    });

    events = vCalendar.groupEvents(events);

    console.log('Fastmail Calendar Overview, grouped events:', events); // eslint-disable-line

    return Promise.resolve(events);
  },

  addMarkup(events) {
    // save some dom refs
    this.wrapper = document.getElementById(WRAPPER_ID);
    const targetDiv = document.querySelectorAll(TARGET_DIV);

    if (targetDiv && targetDiv.length) {
      this.targetDiv = targetDiv[0].parentNode;
    }

    // if both the wrapper and target are missing, fastmail hasn't loaded yet,
    // so short circuit and try again in a little while
    if (!this.wrapper && !this.targetDiv) {
      setTimeout(() => {
        this.addMarkup(events);
      }, 500);

      return;
    }

    // remove the calendar overview if it already exists
    if (this.wrapper) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    const theme = this.getTheme();
    const content = Templates.wrapper(events, theme);

    this.targetDiv.appendChild(content);
    this.wrapper = document.getElementById(WRAPPER_ID);
    this.wrapper.classList.add(theme);
    this.sizeWrapper();
  },

  sizeWrapper() {
    if (!this.wrapper || !this.targetDiv) {
      return;
    }

    const columnHeight = this.targetDiv.getBoundingClientRect().height;
    const lastColumnElement = document.querySelectorAll(LAST_FASTMAIL_ELEMENT)[0];
    const lastElementBottom = lastColumnElement.getBoundingClientRect().bottom;
    const usageHeight = document.querySelectorAll(TARGET_DIV)[0].getBoundingClientRect().height;

    const wrapperHeight = Math.min(
      columnHeight - lastElementBottom - usageHeight,
      MAX_HEIGHT,
    );

    this.wrapper.style.bottom = `${usageHeight}px`;
    this.wrapper.style.height = `${wrapperHeight}px`;

    // hide it entirely when it's too small to read
    this.wrapper.style.display = wrapperHeight < MIN_HEIGHT ? 'none' : 'block';
  },

  getTheme() {
    let res = THEMES.light;

    try {
      const rootEl = document.querySelectorAll(FASTMAIL_ROOT_DIV)[0];
      const backgroundColor = window.getComputedStyle(rootEl)
        .backgroundColor
        .trim()
        .replace(/^rgb\(/, '')
        .replace(/\)/, '')
        .replace(/\s/g, '')
        .split(',');

      const backgroundColorHSL = rgbToHsl(
        backgroundColor[0],
        backgroundColor[1],
        backgroundColor[2],
      );

      res = backgroundColorHSL[2] > 0.5 ? THEMES.light : THEMES.dark;
    } catch (err) {
      // noop
    }

    return res;
  },
};

// run the initiliazer with a self-executing function
(() => {
  // delay initial action for fastmail to initialize
  setTimeout(() => {
    FastmailCalendarOverview.init();
  }, 500);
})();

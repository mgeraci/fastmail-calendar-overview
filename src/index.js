/* global window, document, fetch */

import {
  TARGET_DIV,
  LAST_FASTMAIL_ELEMENT,
  WRAPPER_ID,
  MAX_HEIGHT,
  MIN_HEIGHT,
  REFRESH_INTERVAL,
} from './constants';

import CALENDARS from './calendars';
import vCalendar from './vCalendar';
import Templates from './templates';

import './style.scss';

const FastmailCalendarOverview = {
  init() {
    console.log('Fastmail Calendar Overview, calendars:', CALENDARS); // eslint-disable-line

    this.run();
    this.startInterval();
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

  fetchCalendars() {
    const fetches = CALENDARS.map((calendar) => fetch(calendar.url));

    return Promise.all(fetches)
      .then((responses) => (
        Promise.all(responses.map((res) => res.text()))));
  },

  parseResults(results) {
    let events = [];

    results.forEach((result, i) => {
      const parsedEvents = vCalendar.parse(result, CALENDARS[i].name);
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

    const content = Templates.wrapper(events);

    this.targetDiv.appendChild(content);
    this.wrapper = document.getElementById(WRAPPER_ID);
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
};

// run the initiliazer with a self-executing function
(() => {
  // delay initial action for fastmail to initialize
  setTimeout(() => {
    FastmailCalendarOverview.init();
  }, 500);
})();

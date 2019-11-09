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

    // get and parse the calendar data
    this.fetchCalendars()
      .then((data) => this.parseResults(data))
      .then((data) => this.addMarkup(data));

    // set a timer to refresh the calendars
    this.startInterval();
  },

  startInterval() {
    this.calendarTimer = setInterval(
      this.fetchCalendars.bind(this),
      REFRESH_INTERVAL,
    );
  },

  getTargetDiv() {
    return document.querySelectorAll(TARGET_DIV)[0].parentNode;
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
    this.wrapper = document.getElementById(WRAPPER_ID);
    const newContent = Templates.wrapper(events);

    if (this.wrapper) {
      this.wrapper.innerHTML = newContent;
    } else {
      this.getTargetDiv().appendChild(newContent);
    }

    this.wrapper = document.getElementById(WRAPPER_ID);
    this.sizeWrapper();

    window.addEventListener('resize', this.sizeWrapper.bind(this));
  },

  sizeWrapper() {
    const columnHeight = this.getTargetDiv().getBoundingClientRect().height;
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

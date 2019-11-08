/* global window, document, fetch */

import {
  TARGET_DIV,
  USAGE_DIV,
  WRAPPER_ID,
  MAX_HEIGHT,
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
    return document.getElementById(TARGET_DIV).parentNode;
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

    console.log('Fastmail Calendar Overview, events:', events); // eslint-disable-line

    return Promise.resolve(events);
  },

  addMarkup(events) {
    // prepare the underscore templates for use in the dom
    Templates.init();

    this.wrapper = document.getElementById(WRAPPER_ID);
    const newContent = Templates.wrapper({ events });
    console.log(newContent);

    if (this.wrapper.length) {
      this.wrapper.innerHTML = newContent;
    } else {
      this.getTargetDiv().appendChild(newContent);
    }

    this.wrapper = document.getElementById(WRAPPER_ID);
    this.sizeWrapper();

    // TODO add a resize event listener
    // return $(window).on('resize', this.sizeWrapper.bind(this));
  },

  sizeWrapper() {
    /*
    const columnHeight = this.getTargetDiv().height();
    const lastColumnElement = $('.v-Sources-group');
    const lastElementBottom = lastColumnElement.offset().top + lastColumnElement.outerHeight();
    const usageHeight = $(USAGE_DIV).outerHeight();
    const margin = 20;

    let overviewHeight = columnHeight - lastElementBottom - usageHeight - margin;

    if (overviewHeight > MAX_HEIGHT) {
      overviewHeight = MAX_HEIGHT;
    }

    this.wrapper.css({
      bottom: usageHeight,
      height: overviewHeight,
    });
    */

    this.wrapper.css({
      bottom: 60,
      height: 250,
    });
  },
};

// run the initiliazer with a self-executing function
(() => {
  // delay initial action for fastmail to initialize
  setTimeout(() => {
    FastmailCalendarOverview.init();
  }, 500);
})();

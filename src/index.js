/* global window, fetch */

import {
  TARGET_DIV,
  USAGE_DIV,
} from './constants';

import CALENDARS from './calendars';
import vCalendar from './vCalendar';
import Templates from './templates';

import './style.scss';

const FastmailCalendarOverview = {
  maxHeight: 400,
  interval: 1000 * 60 * 15, // 15 minutes

  init() {
    console.log('Fastmail Calendar Overview, calendars:', CALENDARS); // eslint-disable-line

    Templates.make();

    // delay initial action for fastmail to initialize
    setTimeout(() => {
      this.startInterval();

      this.fetchCalendars()
        .then(this.parseResults)
        .then(this.addMarkup);
    }, 500);
  },

  startInterval() {
    this.calendarTimer = setInterval(this.fetchCalendars.bind(this), this.interval);
  },

  getTargetDiv() {
    return $(TARGET_DIV).parent();
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
    this.wrapper = $('#fastmail-calendar-overview-wrapper');
    const newContent = Templates.wrapper({ events });

    if (this.wrapper.length) {
      this.wrapper.replaceWith(newContent);
    } else {
      this.getTargetDiv().append(newContent);
    }

    this.wrapper = $('#fastmail-calendar-overview-wrapper');
    this.sizeWrapper();

    return $(window).on('resize', this.sizeWrapper.bind(this));
  },

  sizeWrapper() {
    const columnHeight = this.getTargetDiv().height();
    const lastColumnElement = $('.v-Sources-group');
    const lastElementBottom = lastColumnElement.offset().top + lastColumnElement.outerHeight();
    const usageHeight = $(USAGE_DIV).outerHeight();
    const margin = 20;

    let overviewHeight = columnHeight - lastElementBottom - usageHeight - margin;

    if (overviewHeight > this.maxHeight) {
      overviewHeight = this.maxHeight;
    }

    return this.wrapper.css({
      bottom: usageHeight,
      height: overviewHeight,
    });
  },
};

// run the initiliazer with a self-executing function
(() => {
  FastmailCalendarOverview.init();
})();

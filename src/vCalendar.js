import RRule from 'rrule';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';

import {
  MONTHS,
  DAYS_SHORT,
  EVENT_HORIZON,
  VCAL_FIELDS,
  MS_PER_DAY,
} from './constants';

export default {
  // given data from a calendar url, make an array of events
  parse(data, calendar) {
    // save some information about today to the singleton for reuse
    this.now = new Date();
    this.today = this.getMidnightFromTime(this.now);
    this.nowDateBucket = this.getNowDateBucket();

    // the timezone offset is in hours, so convert to ms
    this.gmtOffset = this.now.getTimezoneOffset() * -1 * 60 * 1000;

    const lines = data.split('\n');
    let events = [];
    let event = {};

    Array.from(lines).forEach((line) => {
      Object.keys(VCAL_FIELDS).forEach((fieldName) => {
        const fieldKey = VCAL_FIELDS[fieldName];

        if (this.isLine(line, fieldName)) {
          event[fieldKey] = this.getContent(line);
        }
      });

      // start an event
      if (this.isLine(line, 'BEGIN:VEVENT')) {
        event = {};
        event.calendar = calendar;
      }

      // finish and commit an event
      if (this.isLine(line, 'END:VEVENT')) {
        event = this.processDateFields(event);

        // kill bad descriptions
        if (
          event.description && (
            event.description.indexOf('View your event at https://www.google.com/calendar/event') >= 0
            || event.description.indexOf('-::~') === 0
          )
        ) {
          event.description = false;
        }

        // if this event has a recurring rule, parse it
        if (event.rrule) {
          events = events.concat(this.getEventsFromRecurringEvent(event));

        // if it's an all-day event, just check the date bucket, not the time
        } else if (event.allDay && (event.dateBucket === this.nowDateBucket)) {
          events.push(event);

        // otherwise, if there's a startTimestamp field, and it's in the future, add it
        } else if (event.startTimestamp && (event.startTimestamp >= this.now)) {
          events.push(event);
        }
      }
    });

    return events;
  },

  // given an array of events, return a sorted array of objects with event info
  // and events (sorted by event start time)
  groupEvents(_events) {
    let events = [..._events];
    let res = [];

    // get the dateBucket-style time and reject ones lower than today
    events = events.filter((e) => e.dateBucket >= this.nowDateBucket);
    events = groupBy(events, 'dateBucket');

    Object.keys(events).forEach((day) => {
      let dayEvents = events[day];
      const theseEvents = dayEvents;
      dayEvents = {};
      dayEvents.events = theseEvents;
      dayEvents.displayDate = dayEvents.events[0].displayDate;
      dayEvents.sortDate = dayEvents.events[0].dateBucket;

      // sort the events by allDay, then start time
      dayEvents.events = dayEvents.events.sort((a, b) => {
        let sortRes;

        if (a.allDay && b.allDay) {
          sortRes = a.summary > b.summary;
        } else if (a.allDay && !b.allDay) {
          sortRes = -1;
        } else if (!a.allDay && b.allDay) {
          sortRes = 1;
        } else if (a.startTimestamp > b.startTimestamp) {
          sortRes = 1;
        } else {
          sortRes = -1;
        }

        return sortRes;
      });

      res.push(dayEvents);
    });

    res = sortBy(res, 'sortDate');

    return res;
  },

  // for each of `startTime` and `endTime`, convert the vcal-format timestamp to
  // a unix timestamp, and generate a 'pretty' time for display.
  processDateFields(_event) {
    let event = { ..._event };

    ['start', 'end'].some((field) => {
      const time = event[`${field}Time`];
      const parsedTime = this.parseDate(time);

      // if the `allDay` flag is set, don't try to parse the end time, just set
      // it to be a day later
      if (parsedTime.allDay) {
        event.startTimestamp = this.generateTimestamp(parsedTime);
        event.endTimestamp = event.startTimestamp + MS_PER_DAY;
        event.allDay = true;

        // returning true short circuits the rest of the `some` loop above
        // (since we don't want to calculate separate end times for all-day
        // events)
        return true;
      }

      if (time) {
        event[`${field}Timestamp`] = parsedTime;
      }

      // returning false in a `some` loop causes it to continue
      return false;
    });

    // if there's a start and end timestamp, calculate the duration
    if (event.startTimestamp && event.endTimestamp) {
      const durationMilliseconds = event.endTimestamp - event.startTimestamp;
      let durationHours = durationMilliseconds / 3600000;

      if (durationHours === 24) {
        durationHours = 'All day';
      } else {
        const suffix = durationHours === 1 ? 'hour' : 'hours';
        durationHours = `${durationHours} ${suffix}`;
      }

      event.durationHours = durationHours;
    }

    if (!event.rrule) {
      event = this.addDateInfo(event);
    }

    return event;
  },

  addDateInfo(_event) {
    const event = { ..._event };
    const eventDateObj = new Date(event.startTimestamp);

    const year = eventDateObj.getFullYear();
    const month = eventDateObj.getMonth();
    const monthName = MONTHS[month];
    const day = eventDateObj.getDate();
    const dayOfWeek = DAYS_SHORT[eventDateObj.getDay()];

    // make the display date
    switch (this.daysBetween(this.getMidnightFromTime(eventDateObj), this.today)) {
      case 0:
        event.displayDate = 'Today';
        break;
      case 1:
        event.displayDate = 'Tomorrow';
        break;
      default:
        event.displayDate = `${dayOfWeek}, ${monthName} ${day}`;
    }

    // make the sort date
    event.dateBucket = `${year}${this.stringPadNumber(month + 1)}${this.stringPadNumber(day)}`;

    // add a time, or 'all day'
    if (event.allDay) {
      event.timeString = false;

      return event;
    }

    const hours = eventDateObj.getHours();
    const minutes = eventDateObj.getMinutes();
    event.timeString = `${this.stringPadNumber(hours)}:${this.stringPadNumber(minutes)}`;

    return event;
  },

  stringPadNumber(num) {
    if (num < 10) {
      return `0${num}`;
    }

    return num;
  },

  parseDate(_dateString) {
    let dateString = `${_dateString}`;
    let date;
    const res = {};

    // all day events don't have a time, just the date; fake the time and bail
    if (dateString.indexOf('VALUE=DATE:') >= 0) {
      date = dateString.replace('VALUE=DATE:', '');

      res.year = date.slice(0, 4);
      res.month = date.slice(4, 6);
      res.day = date.slice(6, 8);
      res.hour = 0;
      res.minute = 0;
      res.second = 0;
      res.allDay = true;

      return res;
    }

    // get the time zone, if present
    if (dateString.indexOf('TZID') >= 0) {
      res.timezone = dateString.replace(/TZID=(.+?):.+/, '$1');
      dateString = dateString.replace(/TZID=.+?:/, '');
    }

    dateString = dateString.split('T');
    [date] = dateString;
    const time = dateString[1];

    res.year = date.slice(0, 4);
    res.month = date.slice(4, 6);
    res.day = date.slice(6, 8);
    res.hour = time.slice(0, 2);
    res.minute = time.slice(2, 4);
    res.second = time.slice(4, 6);

    let timestamp = this.generateTimestamp(res);

    // if the time section ends with a `Z`, that indicates Zulu time, aka GMT. so
    // convert to local time.
    if (time[6] === 'Z') {
      timestamp += this.gmtOffset;
    }

    return timestamp;
  },

  // given an event with an `rrule` flag, generate individual events into the
  // future
  getEventsFromRecurringEvent(_event) {
    const event = { ..._event };
    const res = [];

    // convert the starttime into a format that rrule understands (in
    // zulu time)
    const timestamp = event.startTimestamp;
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = this.stringPadNumber(date.getMonth() + 1);
    const day = this.stringPadNumber(date.getDate());
    const eventTime = new Date(new Date(event.startTimestamp).getTime() - this.gmtOffset);
    const hours = this.stringPadNumber(eventTime.getHours());
    const minutes = this.stringPadNumber(eventTime.getMinutes());
    const seconds = '00';
    const rruleStart = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;

    event.rrule = `${event.rrule};DTSTART=${rruleStart}`;
    event.rrule = event.rrule.replace(/[\s\n\r\t]/g, '');

    // create an RRule object from the string that we've created
    const rule = RRule.fromString(event.rrule);

    // get a set of applicable events for this rule in the given time
    // frame (e.g., from now until a month from now). make the start time
    // yesterday to catch edge cases around midnight.
    const eventDates = rule.between(
      new Date(this.now.getTime() - MS_PER_DAY),
      new Date(this.now.getTime() + EVENT_HORIZON),
    );

    eventDates.forEach((eventDateString) => {
      const eventDate = new Date(eventDateString);

      // make a new instance of the recurring event, but delete the non-
      // applicable fields, and replace the start with this instance's
      let eventInstance = { ...event };

      delete eventInstance.startTime;
      delete eventInstance.endTime;
      delete eventInstance.endTimestamp;

      eventInstance.startTimestamp = eventDate.getTime();
      eventInstance = this.addDateInfo(eventInstance);

      res.push(eventInstance);
    });

    return res;
  },

  // generate a UTC timestamp
  generateTimestamp(params) {
    const timestampUTC = new Date(
      params.year,
      params.month - 1, // month is 0-indexed
      params.day,
      params.hour,
      params.minute,
      params.second,
    );

    // convert the timestamp to the correct hour for our timezone
    return timestampUTC.getTime();
  },

  // get a date object representing the start of a day
  getMidnightFromTime(time) {
    const year = time.getFullYear();
    const month = time.getMonth();
    const day = time.getDate();

    return new Date(year, month, day);
  },

  // caluclate the number of days between two unix timestamps
  daysBetween(event, now) {
    const diff = Math.abs(now - event);
    return Math.floor(diff / MS_PER_DAY);
  },

  // given a line of text and a search string, return a boolean for if the search
  // is found at the start of the line
  isLine(line, str) {
    return line.indexOf(str) === 0;
  },

  // parse the vCalendar line to remove the key
  getContent(line) {
    return line.replace(/^[A-Z]+?[:;]/, '')
      .replace(/\\,/g, ',')
      .replace(/\\n/g, '<br>');
  },

  // get today's date in the format YYYYMMDD
  getNowDateBucket() {
    const year = this.now.getFullYear();
    const month = this.stringPadNumber(this.now.getMonth() + 1);
    const day = this.stringPadNumber(this.now.getDate());

    return `${year}${month}${day}`;
  },
};

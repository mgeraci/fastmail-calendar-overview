import RRule from 'rrule';
import reject from 'lodash/reject'; // TODO replace with native filter
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';

import {
  MONTHS,
  DAYS_SHORT,
} from './constants';

export default {
  // how many instances of a recurring event to add to our timeline
  recurringCount: 5,

  // given data from a calendar url, make an array of events
  parse(data, calendar) {
    const lines = data.split('\n');
    const events = [];
    let event = {};
    this.now = new Date();
    const nowDateBucket = this.getNowDateBucket();
    this.today = this.getMidnightFromTime(this.now);

    // how far into the future to get events (one month)
    this.distance = 1000 * 60 * 60 * 24 * 30;

    // offset is in hours, so convert
    this.offset = this.now.getTimezoneOffset() * -1 * 60 * 1000;

    Array.from(lines).forEach((line) => {
      // all fields
      Object.keys(this.fields || {}).forEach((fieldName) => {
        const fieldKey = this.fields[fieldName];

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
        this.processDateFields(event);

        // kill bad descriptions
        if ((event.description != null ? event.description.indexOf('View your event at https://www.google.com/calendar/event') : undefined) >= 0) {
          event.description = false;
        }

        // if this event has a recurring rule, parse it
        if (event.rrule) {
          // convert the starttime into a format that rrule understands (in
          // zulu time)
          // timestamp = event.startTimestamp + @offset
          const timestamp = event.startTimestamp;
          const date = new Date(timestamp);

          const year = date.getFullYear();
          const month = this.stringPadNumber(date.getMonth() + 1);
          const day = this.stringPadNumber(date.getDate());
          const eventTime = new Date(new Date(event.startTimestamp).getTime() - this.offset);
          const hours = this.stringPadNumber(eventTime.getHours());
          const minutes = this.stringPadNumber(eventTime.getMinutes());
          const seconds = '00';
          const rruleStart = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;

          event.rrule = `${event.rrule};DTSTART=${rruleStart}`;
          event.rrule = event.rrule.replace(/[\s\n\r\t]/g, '');

          // create an RRule object from the string that we've created
          const rule = RRule.fromString(event.rrule);

          // get a set of applicable events for this rule in the given time frame
          // (e.g., from now until a month from now)
          const ruleStartTime = new Date(this.now.getTime() - (1000 * 60 * 60 * 24));
          const eventDates = rule.between(
            ruleStartTime,
            new Date(this.now.getTime() + this.distance),
          );

          Array.from(eventDates).forEach((eventDateString) => {
            const eventDate = new Date(eventDateString);

            // make a new instance of the recurring event, but delete the non-
            // applicable fields, and replace the start with this instance's
            const eventInstance = { ...event };

            delete eventInstance.startTime;
            delete eventInstance.endTime;
            delete eventInstance.endTimestamp;

            eventInstance.startTimestamp = eventDate.getTime();

            this.addDateInfo(eventInstance);
            events.push(eventInstance);
          });

        // if it's an all-day event, just check the date bucket, not the time
        } else if (event.allDay && (event.dateBucket === nowDateBucket)) {
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
  groupEvents(events) {
    let res = [];

    // get the dateBucket style time and reject ones lower than today
    const nowDateBucket = parseInt(this.getNowDateBucket(), 10);
    events = reject(events, (e) => parseInt(e.dateBucket, 10) < nowDateBucket);
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
        if (a.allDay && b.allDay) {
          return a.summary > b.summary;
        } else if (a.allDay && !b.allDay) {
          return -1;
        } else if (!a.allDay && b.allDay) {
          return 1;
        } else if (a.startTimestamp > b.startTimestamp) {
          return 1;
        } else {
          return -1;
        }
      });

      res.push(dayEvents);
    });

    res = sortBy(res, 'sortDate');

    return res;
  },

  // for each of `startTime` and `endTime`, convert the vcal-format timestamp to
  // a unix timestamp, and generate a 'pretty' time for display.
  processDateFields(event) {
    ['start', 'end'].some((field) => {
      const time = event[`${field}Time`];
      const parsedTime = this.parseDate(time);

      // if the `allDay` flag is set, don't try to parse the end time, just set
      // it to be a day later
      if (parsedTime.allDay) {
        event.startTimestamp = this.generateTimestamp(parsedTime);
        event.endTimestamp = event.startTimestamp + 86400000;
        event.allDay = true;

        // returning true short circuits the rest of the `some` loop above
        // (since we don't want to calculate separate end times for all-day
        // events)
        return true;
      }

      if (time) {
        event[`${field}Timestamp`] = parsedTime;
      }
    });

    // if there's a start and end timestamp, calculate the duration
    if (event.startTimestamp && event.endTimestamp) {
      const durationMilliseconds = event.endTimestamp - event.startTimestamp;
      let durationHours = durationMilliseconds / 3600000;

      if (durationHours === 24) {
        durationHours = 'All day';
      } else {
        let addendum;
        if (durationHours === 1) {
          addendum = 'hour';
        } else {
          addendum = 'hours';
        }

        durationHours = `${durationHours} ${addendum}`;
      }

      event.durationHours = durationHours;
    }

    if (!event.rrule) {
      return this.addDateInfo(event);
    }
  },

  addDateInfo(event) {
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
      return;
    }

    const hours = eventDateObj.getHours();
    const minutes = eventDateObj.getMinutes();

    event.timeString = `${this.stringPadNumber(hours)}:${this.stringPadNumber(minutes)}`;
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
      timestamp += this.offset;
    }

    return timestamp;
  },

  // generate a unix timestamp
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
    return Math.floor(diff / 86400000);
  },

  // a list of fields to extract
  fields: {
    UID: 'id',
    SUMMARY: 'summary',
    DESCRIPTION: 'description',
    LOCATION: 'location',
    DTSTART: 'startTime',
    DTEND: 'endTime',
    RRULE: 'rrule',
  },

  // given a line of text and a search string, return a boolean for if the search
  // is found in the line
  isLine(line, str) {
    return line.indexOf(str) === 0;
  },

  // parse the vCalendar line to remove the key
  getContent(line) {
    return line.replace(/^[A-Z]+?[:;]/, '')
      .replace(/\\,/g, ',')
      .replace(/\\n/g, '<br>');
  },

  getNowDateBucket() {
    return `${this.now.getFullYear()}${this.stringPadNumber(this.now.getMonth() + 1)}${this.stringPadNumber(this.now.getDate())}`;
  },
};

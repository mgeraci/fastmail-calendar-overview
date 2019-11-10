// the calendar gets added as a sibling to this element
export const TARGET_DIV = '.v-Quota';

// the last element in the fastmail sidebar; this is used to determine the
// height of the calendar overview
export const LAST_FASTMAIL_ELEMENT = '.v-Sources-list';

// the id on the top-level element added to the dom by this extension
export const WRAPPER_ID = 'fastmail-calendar-overview-wrapper';

// height of the calendar area
export const MAX_HEIGHT = 400;
export const MIN_HEIGHT = 150;
export const REFRESH_INTERVAL = 1000 * 60 * 15; // 15 minutes

// how far into the future to show events (1 month)
export const EVENT_HORIZON = 1000 * 60 * 60 * 24 * 30;

export const MS_PER_DAY = 86400000;

// the fields in a vcal event
export const VCAL_FIELDS = {
  UID: 'id',
  SUMMARY: 'summary',
  DESCRIPTION: 'description',
  LOCATION: 'location',
  DTSTART: 'startTime',
  DTEND: 'endTime',
  RRULE: 'rrule',
};

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DAYS_SHORT = [
  'Sun',
  'Mon',
  'Tues',
  'Wed',
  'Thurs',
  'Fri',
  'Sat',
];

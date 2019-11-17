export const FIELDS = {
  name: 'name',
  url: 'url',
};

export const FIELD_ORDER = [
  [FIELDS.name],
  [FIELDS.url],
];

export const FIELD_LABELS = {
  [FIELDS.name]: 'Name',
  [FIELDS.url]: 'URL',
};

const emptyCalendar = {};

FIELD_ORDER.forEach((field) => {
  emptyCalendar[field] = '';
});

export const EMPTY_CALENDAR = emptyCalendar;

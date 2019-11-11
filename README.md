# Fastmail Calendar Overview
This browser extension requests calendar data from a list of calendars and adds
an overview of your upcoming events to the sidebar on Fastmail. It works with
both Firefox and Chrome.

Note that your calendars must be Fastmail calendars, hosted on `https://user.fm`.

## Installation
To install:
1) `git clone git@github.com:mgeraci/fastmail-calendar-overview.git`
1) `cd fastmail-calendar-overview`
1) `yarn install`
1) Create a list of calendars (see below)

## Adding calendars
While in the future this should be moved to an "options" pane to allow non-
technical users to add calendars, for now, create the file `src/calendars.js`.
This is a list of the calendars that the extension should poll, and is git
ignored.

Note that your calendars must be Fastmail calendars, hosted on `https://user.fm`.
To get your calendar url, go to the "Calendars" section of Fastmail's settings
page, click the "Edit & share" button next to the calendar that you'd like to
add, make sure the "Full event details" checkbox is selected, and copy the url
listed.

The contents should be in the format:

```.js
export default [
  {
    name: 'My Calendar', // replace with your calendar name
    url: 'https://user.fm/calendar/...', // replace with your calendar url
  },

  // add as many calendar entries as you'd like!
];
```

## Compilation
To compile the app for development, run `yarn watch`. This will start a webpack
watcher and compile files on change. To compile the files once without watching,
run `yarn build`.

The root of the app is `src/index.js`.

## Adding to your browser for development

### Adding to Firefox
To add the extension to Firefox, go to the "This Firefox" section of the
[firefox debugging page](about:debugging#/runtime/this-firefox), expand the
"Temporary extensions" section, press the "Load temporary Add-on" button,
navigate into the cloned repo, and select the `manifest.json` file.

### Adding to Chrome
To add the extension to Chrome, go to your [extensions page](chrome://extensions/),
click the "Load Unpacked Extension" button, navigate to the extension folder,
and click "open".

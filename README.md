# Fastmail Calendar Overview
This browser extension requests calendar data from a list of calendars and adds
an overview of your upcoming events to the sidebar on Fastmail.

## Installation
To install:
1) `git clone git@github.com:mgeraci/fastmail-calendar-overview.git`
1) `cd fastmail-calendar-overview`
1) `yarn install`

Then, create the file `src/calendars.js`. This is a list of the calendars that
the extension should poll. In the future, this may be moved to an "options"
page for the extension. The contents should be:

```.js
export default [
  {
    name: 'My Calendar', // replace with your calendar name
    url: 'https://...', // replace with your calendar url
  },

  // add as many calendar entries as you'd like!
];
```

## Compilation
To compile the app for development, run `yarn watch`. This will start a webpack
watcher and compile files on change. To compile the files once without watching,
run `yarn build`.

The root of the app is `src/index.js`.

## Adding to Chrome
To add the extension to Chrome, go to your extensions page, click the "Load
Unpacked Extension" button, navigate to the extension folder, and click "open".

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
1) Add to your browser (see below)
1) Create a list of calendars in the extension preferences

## Compilation
To compile the app for development, run `yarn watch`. This will start a webpack
watcher and compile files on change. To compile the files once without watching,
run `yarn build`.

The root of the extension is `src/extension/index.js`, and the root of the
options panel is `src/options/index.js`.

## Adding to your browser for development

### Adding to Firefox
To add the extension to Firefox, go to the "This Firefox" section of the
firefox debugging page (`about:debugging#/runtime/this-firefox`), expand the
"Temporary extensions" section, press the "Load temporary Add-on" button,
navigate into the cloned repo, and select the `manifest.json` file.

### Adding to Chrome
To add the extension to Chrome, go to your extensions page (`chrome://extensions/`),
click the "Load Unpacked Extension" button, navigate to the extension folder,
and click "open".

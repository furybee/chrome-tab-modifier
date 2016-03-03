# <img src="dist/img/icon_32.png" alt="icon"> Tab Modifier

[![Build Status](http://img.shields.io/travis/sylouuu/chrome-tab-modifier.svg?style=flat)](https://travis-ci.org/sylouuu/chrome-tab-modifier)
[![devDependency Status](http://img.shields.io/david/dev/sylouuu/chrome-tab-modifier.svg?style=flat)](https://david-dm.org/sylouuu/chrome-tab-modifier#info=devDependencies)

Take control of your tabs:

* Rename the tab
* Change the tab icon
* Pin the tab
* Prevent tab closing
* Unique tab
* Mute the tab

## How to use?

1. Download and install from the **[Chrome Web Store](https://chrome.google.com/webstore/detail/hcbgadmbdkiilgpifjgcakjehmafcjai/)**.
2. Click on the <img src="dist/img/icon_16.png" alt="icon"> icon in your toolbar to access Options.
3. Configure your tab rules.
4. Try & enjoy!

## Demo

### Before

<img src="screenshots/tabs+before.png" alt="tabs before">

### After

<img src="screenshots/tabs+after.png" alt="tabs after">

* Youtube tab has been modified: use Google icon and pinned state.
* My Website tabs have been modified: use a prefix in title.
* Twitter tab has been modified: use default Chrome icon (white paper) and renamed to "I'm working hard!".

## Examples

You have infinite possibilities, here are some configurations:

Pin all tabs:

* **URL fragment**: "http"
* **Pinned**: ON

Say hello to all Google websites:

* **URL fragment**: "google.com"
* **Title**: Hello Google: {title}

Disguise GitHub as Google

* **URL fragment**: "github.com"
* **Title**: Google
* **Icon**: https://www.google.com/favicon.ico

Prevent accidental tab closure:

* **URL fragment**: "important-website.com"
* **Protected**: ON

Mute all Youtube videos by default:

* **URL fragment**: "youtube.com"
* **Mute**: ON

Set blank icon on Pinterest:

* **URL fragment**: "pinterest.com"
* **Icon**: select "Chrome > Default"

Get only one GMail tab opened at once:

* **URL fragment**: "mail.google.com"
* **Unique**: ON

Build your own... :muscle:

## Options

### Tab Rules

<img src="screenshots/tab_rules.png" alt="tab_rules">

### Tab Rules Form

<img src="screenshots/tab_rules_form.png" alt="tab_rules_form">

### Settings

<img src="screenshots/settings.png" alt="settings">

### Help

<img src="screenshots/help.png" alt="help">

## Known issues

* The extension can't access to Chrome pages `chrome://` ([#11](https://github.com/sylouuu/chrome-tab-modifier/issues/11)).
* Dynamic favicons are not supported ([#16](https://github.com/sylouuu/chrome-tab-modifier/issues/16)).

## Changelog

See [releases](https://github.com/sylouuu/chrome-tab-modifier/releases) section.

## Development

In case you want to contribute or just want to play with the code, follow the guide.

### Setup

Download and install [NodeJS](http://nodejs.org/download/) to get [npm](https://www.npmjs.org/).

Install `gulp` globally:

```bash
sudo npm install -g gulp
```

Clone the project and install dependencies with `npm install`.

Type `gulp` to watch your changes inside `src/` folder or type `gulp build` after each change.

### Load your local extension in Chrome

Go to `chrome://extensions/` and enable the "Developer mode".

Click on "Load unpacked extension..." and select the project `dist/` folder.

## License

See [license](LICENSE.md) file.

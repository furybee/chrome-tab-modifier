# <img src="dist/img/icon_32.png" alt="icon"> Tab Modifier

Take control of your tabs.

[![Build Status](http://img.shields.io/travis/sylouuu/chrome-tab-modifier.svg?style=flat)](https://travis-ci.org/sylouuu/chrome-tab-modifier)
[![devDependency Status](http://img.shields.io/david/dev/sylouuu/chrome-tab-modifier.svg?style=flat)](https://david-dm.org/sylouuu/chrome-tab-modifier#info=devDependencies)

## Features

* Rename the tab
* Change the tab icon
* Pin the tab
* Prevent tab closing
* Unique tab
* Mute the tab

## Why

I needed a quick UI element in Chrome to know the environment of the tab, as a Web developer I use local website, the pre-production and the production versions.

Not easy to find the appropriate tab when your 3 tabs are called "My awesome website".

I created Tab Modifier to add prefixes to website titles with a specific match.

* [DEV] My awesome website: `.local.domain.com`
* [PREPROD] My awesome website: `.preprod.domain.com`
* [PROD] My awesome website: `.domain.com`

After that, I have added more features like "auto-pin", custom favicons and more.

## Installation

Install from the **[Chrome Web Store](https://chrome.google.com/webstore/detail/hcbgadmbdkiilgpifjgcakjehmafcjai/)**.

## Usage

* Click on the <img src="dist/img/icon_16.png" alt="icon"> icon to open Options.
* Create your tab rules.
* Try & enjoy!

## Demo

### Before

<img src="screenshots/tabs+before.png" alt="tabs before">

### After

<img src="screenshots/tabs+after.png" alt="tabs after">

* Youtube tab has been modified: use Google icon and pinned state.
* My Website tabs have been modified: use a prefix in title.
* Twitter tab has been modified: use default Chrome icon (white paper) and renamed to "I'm working hard!".

## Options

### Tab Rules

<img src="screenshots/tab_rules.png" alt="tab_rules">

### Tab Rules Form

<img src="screenshots/tab_rules_form.png" alt="tab_rules_form">

### Settings

<img src="screenshots/settings.png" alt="settings">

### Help

<img src="screenshots/help.png" alt="help">

## Examples

You have infinite possibilities, here are some configurations:

Pin all tabs:

* **URL fragment**: http
* **Pinned**: ON

Say hello to all Google websites:

* **URL fragment**: google.com
* **Title**: Hello Google: {title}

Disguise GitHub as Google

* **URL fragment**: github.com
* **Title**: Google
* **Icon**: https://www.google.com/favicon.ico

Prevent accidental tab closure:

* **URL fragment**: important-website.com
* **Protected**: ON

Mute all Youtube videos by default:

* **URL fragment**: youtube.com
* **Mute**: ON

Set blank icon on Pinterest:

* **URL fragment**: pinterest.com
* **Icon**: select "Chrome > Default"

Get only one GMail tab opened at once:

* **URL fragment**: mail.google.com
* **Unique**: ON

Customize title with HTML selector and Regexp:

* **URL fragment**: github.com
* **Title**: {title} | $2 by $1
* **URL matcher**: github[.]com/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)

Tab title will be: "sylouuu/chrome-tab-modifier: Take control of your tabs | chrome-tab-modifier by sylouuu"

And now, build your own... :muscle:

## Known issues

### Local icon path doesn't work

Related issue: [#5](https://github.com/sylouuu/chrome-tab-modifier/issues/5)

Due to browser security restrictions, this path won't work: `file://<path>/icon.png`.
Your icon will not be shown by Chrome.

Alternatively, you can upload your icon somewhere like [imgur.com](http://imgur.com/) and paste the direct link in your rule.

### Chrome system pages `chrome://`

Related issues: [#11](https://github.com/sylouuu/chrome-tab-modifier/issues/11), [#14](https://github.com/sylouuu/chrome-tab-modifier/issues/14)

Pages that start with `chrome://` URL are protected. No content script can be injected then Tab Modifier will not work on these pages.

### Dynamic favicon

Related issue: [#16](https://github.com/sylouuu/chrome-tab-modifier/issues/16)

The extension does not detect website with dynamic favicon.

For example, you set a custom favicon on a website, on the page reload, the default favicon will be replaced by yours.
In case the website wants to replace the favicon by a new one in Javascript, like prepending with "(1)", e.g. a notification,
Tab Modifier will not detect this change.

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

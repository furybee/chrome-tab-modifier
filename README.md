# <img src="dist/img/icon_32.png" alt="icon"> Tab Modifier

Take control of your tabs.

[![Build Status](http://img.shields.io/travis/sylouuu/chrome-tab-modifier.svg?style=flat)](https://travis-ci.org/sylouuu/chrome-tab-modifier)
[![devDependency Status](http://img.shields.io/david/dev/sylouuu/chrome-tab-modifier.svg?style=flat)](https://david-dm.org/sylouuu/chrome-tab-modifier#info=devDependencies)

## Features

* Rename tab
* Change tab icon
* Pin tab
* Prevent tab closing
* Unique tab
* Mute tab

Quick rename can be done by right-clicking anywhere in the page and click on "Rename Tab".

## Why?

I needed a quick UI element in Chrome to know the environment of the tab, as a Web developer I often use multiple versions of the same website: local, pre-production and production.

Not easy to find the appropriate tab when you have multiple tabs called "My awesome website".

I created Tab Modifier to add prefixes to website titles with a specific match.

* [DEV] My awesome website: `.local.domain.com`
* [PREPROD] My awesome website: `.preprod.domain.com`
* [PROD] My awesome website: `.domain.com`

After that, I have added more features like "auto-pin", custom favicons and more.

## Focused scope

Tab Modifier is based on user *rules* and act on the tab URL that matches the first seen rule.

Aware of that, there is no reason to include a feature that is not "rule-based". Prefer to install specific extensions.

## Installation

Install from the **[Chrome Web Store](https://chrome.google.com/webstore/detail/hcbgadmbdkiilgpifjgcakjehmafcjai/)**.

Also available for **[Opera Browser](https://addons.opera.com/fr/extensions/details/tab-modifier/)**.

Not available for **Firefox**, refer to [#46](https://github.com/sylouuu/chrome-tab-modifier/issues/46).

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

## Examples

You have infinite possibilities, here are some configurations:

Pin all tabs:

* **Detection**: Contains
* **URL fragment**: http
* **Pinned**: ON

Say hello to all Google websites:

* **Detection**: Contains
* **URL fragment**: google.com
* **Title**: Hello Google: {title}

Disguise GitHub as Google

* **Detection**: Contains
* **URL fragment**: github.com
* **Title**: Google
* **Icon**: https://www.google.com/favicon.ico

Prevent accidental tab closure:

* **Detection**: Contains
* **URL fragment**: important-website.com
* **Protected**: ON

Mute all Youtube videos by default:

* **Detection**: Contains
* **URL fragment**: youtube.com
* **Mute**: ON

Set blank icon on Pinterest:

* **Detection**: Contains
* **URL fragment**: pinterest.com
* **Icon**: select "Chrome > Default"

Get only one GMail tab opened at once:

* **Detection**: Starts with
* **URL fragment**: https://mail.google.com
* **Unique**: ON

Pin all PNG images (useless):

* **Detection**: Ends with
* **URL fragment**: .png
* **Pinned**: ON

Customize title with HTML selector and Regexp:

* **Detection**: Contains
* **URL fragment**: github.com
* **Title**: {title} | $2 by $1
* **URL matcher**: github[.]com/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)

Tab title will be: "sylouuu/chrome-tab-modifier: Take control of your tabs | chrome-tab-modifier by sylouuu"

Match GitHub repositories:

* **Detection**: RegExp
* **URL fragment**: github[.]com/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)
* **Title**: I got you GitHub!

Customize GMail title with Title matcher and URL matcher:

* **Detection**: Contains
* **URL fragment**: mail.google.com
* **Title**: @0 | $0
* **Title matcher**: [a-z]*@gmail.com
* **URL matcher**: [a-z]*.google.com

Tab title will be: "youremail@gmail.com | mail.google.com"

Github final path as title for blobs:

* **Detection**: RegExp
* **URL fragment**: github[.]com/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)/blob/
* **Title**: {.final-path}

And now, build your own... :muscle:

## Ideas

* Require password after inactivity.

## Known issues

### Local icon path doesn't work

Related issue: [#5](https://github.com/sylouuu/chrome-tab-modifier/issues/5)

Due to browser security restrictions, this path won't work: `file://<path>/icon.png`.
Your icon will not be shown by Chrome.

Alternatively, you can upload your icon somewhere like [imgur.com](http://imgur.com/) and paste the direct link in your rule.

Another solution consists in transform your image in the [Data URI format](https://en.wikipedia.org/wiki/Data_URI_scheme). Go to [ezgif.com](https://ezgif.com/image-to-datauri) and paste the given output (the long text) in the icon input on your rule.

### Chrome system pages `chrome://`

Related issues: [#11](https://github.com/sylouuu/chrome-tab-modifier/issues/11), [#14](https://github.com/sylouuu/chrome-tab-modifier/issues/14)

Pages that start with `chrome://` URL are protected. No content script can be injected then Tab Modifier will not work on these pages.

### Local files `file:///`

Related issue: [#13](https://github.com/sylouuu/chrome-tab-modifier/issues/13)

By default, extensions don't have access to local files. You have to opt-in "Allow access to file URLs" from `chrome://extensions/?id=hcbgadmbdkiilgpifjgcakjehmafcjai`.

### Protected action is not triggered

Related issue: [#95](https://github.com/sylouuu/chrome-tab-modifier/issues/95)

Since Chrome 90, the JS event that triggers a refresh or a closure has been reworked. See related issue.

## Changelog

See [releases](https://github.com/sylouuu/chrome-tab-modifier/releases) section.

## Development

In case you want to contribute or just want to play with the code, follow the guide.

### Setup

Download and install [NodeJS](http://nodejs.org/download/) to get [npm](https://www.npmjs.org/).

Install `gulp` and `yarn` globally:

```bash
npm install -g gulp yarn
```

Clone the project and install dependencies with `yarn`.

Type `gulp` to watch your changes inside `src/` folder or type `gulp build` after each change.

### Load local extension in Chrome

Go to `chrome://extensions/` and enable the "Developer mode".

Click on "Load unpacked extension..." and select the project `dist/` folder.

## Donators

A huge thanks to all donators!

If you like my work and you want to support me, visit the [PayPal link](https://www.paypal.me/sylvainvalienne/5). ;)

## License

See [license](LICENSE.md) file.

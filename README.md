# Tab Modifier

[![Build Status](http://img.shields.io/travis/sylouuu/chrome-tab-modifier.svg?style=flat)](https://travis-ci.org/sylouuu/chrome-tab-modifier)
[![devDependency Status](http://img.shields.io/david/dev/sylouuu/chrome-tab-modifier.svg?style=flat)](https://david-dm.org/sylouuu/chrome-tab-modifier#info=devDependencies)
[![Version](http://img.shields.io/npm/v/chrome-tab-modifier.svg?style=flat)](https://www.npmjs.org/package/chrome-tab-modifier)
[![CodeClimate](http://img.shields.io/codeclimate/github/sylouuu/chrome-tab-modifier.svg?style=flat)](https://codeclimate.com/github/sylouuu/chrome-tab-modifier)

This Chrome extension allows you to **automatically** change some of your tabs properties, here is the features list:

* Rename the tab
* Change the tab icon
* Pin the tab
* Prevent tab closing
* Unique tab

### How?

1. Download and install from the **[Chrome Web Store](https://chrome.google.com/webstore/detail/hcbgadmbdkiilgpifjgcakjehmafcjai/)**.
2. Create a JSON file like `tab_modifier.json`.
2. Copy/paste the sample file below in your file.
3. Go to the extension Options page: open [chrome://extensions/](chrome://extensions/), and click on the **Options** link for the **Tab Modifier** extension.
4. Import your `tab_modifier.json` file.
5. Done! Your settings are saved in your localStorage, but I recommend you to keep your file as a backup.

## Demo

### Result

<img src="https://raw.github.com/sylouuu/chrome-tab-modifier/master/screenshots/tabs.png" alt="tabs">

### Settings file (sample)

```json
{
    ".local": {
        "title": "[DEV] {title}"
    },
    "domain.com": {
        "title": "[PROD] {title}"
    },
    "youtube.com": {
        "icon": "https://www.google.com/favicon.ico",
        "pinned": true
    },
    "twitter.com": {
        "title": "I'm working hard!",
        "icon": "{default}",
        "protected": true
    },
    "mail.google.com": {
        "unique": true
    },
    "pinterest.com/search" : {
      "title" : "$1 | Pinterest",
      "url_matcher" : "q=([^&]+)"
    },
    "github.com": {
        "title": "[$1::$2] {title}",
        "url_matcher": "github\\.com\/([A-Za-z0-9\\-\\_]+)\/([A-Za-z0-9\\-\\_]+)"
    }
}
```

## File format

```json
{
    "string to match the URL": {
        "title": "...",
        "icon": "http://...",
        "pinned": true,
        "protected": true,
        "unique": true
    }
}
```

| Property      | Description                                               |
| :------------ | :-------------------------------------------------------- |
| `title`       | The new title you want to display. You can use use `{title}` inside to append the current website title. |
| `icon`        | URL for the new favicon. For removing the default favicon website, use `{default}` to append the Default Chrome favicon (white paper). |
| `pinned`      | `true` to pin the tab, otherwise nothing happens. |
| `protected`   | `true` will ask you before closing the tab. |
| `unique`      | `true` will prevent for opening a new tab if it is already opened. |

## Examples

Pin all tabs:

```json
{
    "http": {
        "pinned": true
    }
}
```

Say hello to all Google websites:

```json
{
    "google.com": {
        "title": "Hello Google: {title}"
    }
}
```

Prevent accidental tab closure:

```json
{
    "important-website.com": {
        "protected": true
    }
}
```

Get only one GMail tab opened at once:

```json
{
    "mail.google.com": {
        "unique": true
    }
}
```

## Options page

<img src="https://raw.githubusercontent.com/sylouuu/chrome-tab-modifier/master/screenshots/options.png" alt="options">

## Known issues

* The extension does not support self-refreshing tabs such as Twitter, etc.

# Changelog

2015-04-12 - **0.5.0**

* Added `protected` property ([#8](https://github.com/sylouuu/chrome-tab-modifier/issues/8))
* Added `unique` property ([#8](https://github.com/sylouuu/chrome-tab-modifier/issues/8))

2015-03-30 - **0.4.1**

* Fixed settings: first match must be taken if many matches found

2015-03-29 - **0.4.0**

* Improved scripts performances, lighter and faster
* Removed jQuery
* Updated Options page UI
* Added `Gulp`
* Added unit tests

2015-03-02 - **0.3.1**

* Replaced Event Page instead of Background Page ([#4](https://github.com/sylouuu/chrome-tab-modifier/issues/4))

2014-05-27 - **0.3.0**

* Renamed extension to `Tab Modifier`
* Updated extension icon

2014-03-12 - **0.2.1**

* Fixed a non-standard URL retrieving ([#1](https://github.com/sylouuu/chrome-tab-modifier/issues/1))

2014-03-03 - **0.2.0**

* Totally reworked script behavior: content-script <=> background instead of background only
* New feature (icon)

2014-02-27 - **0.1.0**

* New name: `Website Settings`
* New icon
* New JSON file format (BC break)
* New feature (pinned)
* Enhanced options page

2014-02-24 - **0.0.2**

* Replaced icon

2014-02-24 - **0.0.1**

* Initial release

<p align="center">
    <img src="https://raw.github.com/sylouuu/chrome-tab-modifier/master/img/icon_128.png" alt="icon">
</p>

# Tab Modifier

This Chrome extension allows you to automatically change some of your tabs properties, here is the features list:

* Rename the tab
* Change the tab icon
* Pin the tab

## Demo

<img src="https://raw.github.com/sylouuu/chrome-tab-modifier/master/img/screenshots/tabs.png" alt="tabs">

```js
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
        "icon": "{default}"
    }
}
```

## Install

Download and install from the **[Chrome Web Store](https://chrome.google.com/webstore/detail/hcbgadmbdkiilgpifjgcakjehmafcjai/)**.

<p align="center">
    <img src="https://raw.github.com/sylouuu/chrome-tab-modifier/master/img/screenshots/extension.png" alt="extension">
</p>

## Usage

To use this extension, create a `tab_modifier_settings.json` file which contains your settings

### File Syntax

```js
{
    "string to match the complete URL": {
        "title": "New tab title",
        "icon": "New icon URL or {default}"
    },
    "another string, domain name or whatever": {
        "title": "Welcome to {title}",
        "pinned": true
    }
}
```

| Property      | Tag           | Meaning                                                   |
| :-----------: | :-----------: | :-------------------------------------------------------: |
| title         | `{title}`     | Website title, use it if you need to add a prefix/suffix  |
| icon          | `{default}`   | Default Chrome icon (white paper)                         |
| pinned        |               | Pin the tab                                               |


Once created, go to the extensions page: [chrome://extensions/](chrome://extensions/), and click on the **Options** link for the **Tab Modifier** extension.

Import `tab_modifier_settings.json`. Your settings are saved in the localStorage, but I recommend to keep your file as a backup.

## How it works?

Each time you open a page, the script tries to match the URL with your settings, and does the job.

You don't need to use a wildcard such as ```*```. Specify ```cde``` to match ```abcde```, ```cdefg```, ```abcdefg``` and obviously ```cde```.

Warning: once a match is found, the other ones will be ignored.

## Options preview

<img src="https://raw.github.com/sylouuu/chrome-tab-modifier/master/img/screenshots/options.png" alt="options">

# Ideas

* Any suggestion?

# Changelog

2014-05-27 - **0.3.0**

* Renamed extension to `Tab Modifier`
* Updated extension icon

2014-03-12 - **0.2.1**

* Fixed a non-standard URL retrieving #1

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

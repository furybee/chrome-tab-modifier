<p align="center">
    <img src="https://raw.github.com/sylouuu/website-settings/master/img/icon_128.png" alt="icon">
</p>

# Website Settings

This Chrome extension allows you to automatically set some things on a website, such as renaming the title, changing the icon or pinning the tab.

## Install

Download and install from the **[Chrome Web Store](https://chrome.google.com/webstore/detail/hcbgadmbdkiilgpifjgcakjehmafcjai/)**.

<p align="center">
    <img src="https://raw.github.com/sylouuu/website-settings/master/img/screenshots/extension.png" alt="extension">
</p>

## Usage

To use this extension, you must create a JSON file which contains your settings.

### Syntax

```js
{
    "string to match the complete URL": {
        "title": "New page title",
        "icon": "New favicon URL or {default}"
    },
    "another string, domain name or whatever": {
        "title": "Welcome to {title}",
        "pinned": true
    }
}
```

| Property      | Tag               | Meaning                                                   |
| :-----------: | :---------------: | :-------------------------------------------------------: |
| title         | ```{title}```     | Website title, use it if you need to add a prefix/suffix  |
| icon          | ```{default}```   | Default Chrome icon (white paper)                         |

The tab will be pinned if you set ```pinned``` to ```true```.

### Sample file

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

<img src="https://raw.github.com/sylouuu/website-settings/master/img/screenshots/tabs.png" alt="tabs">

Once created, go to the extensions page: [chrome://extensions/](chrome://extensions/) and import your ```file.json```. Your settings are saved locally, you can remove the file.

## How it works?

Each time you open a page, the script tries to match the URL with your settings, and does the job.
Attention, the first match is used, the other ones will be ignored.

## Options preview

<img src="https://raw.github.com/sylouuu/website-settings/master/img/screenshots/options.png" alt="options">

# Ideas

* Any suggestion?

# Changelog

2014-03-03 - **0.2.0**

* Totally reworked script behavior: content-script <=> background instead of background only
* New feature (icon)

2014-02-27 - **0.1.0**

* New name: Website Settings
* New icon
* New JSON file format (BC break)
* New feature (pinned)
* Enhanced options page

2014-02-24 - **0.0.2**

* Replaced icon

2014-02-24 - **0.0.1**

* Initial release

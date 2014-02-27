# Website Settings

This Chrome extension allows you to automatically make some things on a website, such as renaming title.

## Install

Download and install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/hcbgadmbdkiilgpifjgcakjehmafcjai/).

## Usage

To use this extension, you must create a JSON file which contains your settings.

### Syntax

```js
{
    "string to match the complete URL": {
        "title": "New page title"
    },
    "another string, domain name or whatever": {
        "title": "Welcome to {title}",
        "pinned": true
    }
}
```

```{title}``` is the website title. Use this tag if you need to add a prefix/suffix.

The tab will be pinned if you set this property to ```true```.

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
        "pinned": true
    },
    "twitter.com": {
        "title": "I'm working hard!"
    }
}
```

<img src="https://raw.github.com/sylouuu/website-settings/master/img/screenshots/tabs.png" alt="tabs">

Once created, go to the extensions options: chrome://extensions and import your ```file.json```. Your settings are saved locally, you can remove the file.

## How it works?

Each time you open an URL, the extension will try to match the URL with your settings and will replace the title. Attention, the first match is used, the other ones will be ignored.

## Options

<img src="https://raw.github.com/sylouuu/website-settings/master/img/screenshots/options.png" alt="options">

# Ideas

* Change website (fav)icon

# Changelog

2014-02-24 - **0.0.2**

* Replaced icon

2014-02-24 - **0.0.1**

* Initial release

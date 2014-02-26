## Website Environment Identifier

This Chrome extension allows you to automatically add a prefix to the pages you want.

This feature is useful when you have multiple tabs open a site on multiple execution environments (development, pre-production, production ...) to identify them quickly.

<img src="https://raw.github.com/sylouuu/website-environment-identifier/master/img/tabs.png" alt="tabs">

### Install

Download and install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/hcbgadmbdkiilgpifjgcakjehmafcjai/).

### Usage

To use this extension, you must create a file in JSON format where a project contains multiple environments, and the environments contain a prefix and an URL.

### Syntax

```js
{
    "Project Name": {
        "Environment name": {
            "prefix": "prefix",
            "url": "http://project.com"
        },
        ... another environment
    },
    ... another project
}
```

_Note: You are totally free on the names of projects and environments, they are there only for file organization. Only prefixes and URL are used._

### Example

```js
{
    "My Website": {
        "dev": {
            "prefix": "[DEV]",
            "url": "http://my-website.local"
        },
        "preprod": {
            "prefix": "[PREPROD]",
            "url": "http://preprod.my-website.com"
        },
        "prod": {
            "prefix": "[PROD]",
            "url": "http://my-website.com"
        }
    }
}
```

Keep in mind that the first goal was to detect websites environments by the URL.

However, the extension tries to match the URL value with the current loaded (full length) URL. Then you can match any string.

```js
{
    "All": {
        "dev": {
            "prefix": "[DEV]",
            "url": ".local"
        },
        "preprod": {
            "prefix": "[PREPROD]",
            "url": ".preprod.domain.com"
        },
        "prod": {
            "prefix": "[PROD]",
            "url": "domain.com"
        }
    }
}
```

### Options

<img src="https://raw.github.com/sylouuu/website-environment-identifier/master/img/options.png" alt="options">

## Changelog

2014-02-24 - **0.0.2**

* Replaced icon

2014-02-24 - **0.0.1**

* Initial release

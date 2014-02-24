## Website Environment Identifier

This extension allows you to automatically add a prefix to the pages you want.

This feature is useful when you have multiple tabs open a site on multiple execution environments (development, pre-production, production ...) to identify them quickly.

<img src="https://raw.github.com/sylouuu/website-environment-identifier/master/img/tabs.png" alt="tabs">

### Install

Download and install from the [Chrome Web Store](https://github.com/).

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
            "url": "http://my-website.preprod.com"
        },
        "prod": {
            "prefix": "[PROD]",
            "url": "http://my-website.com"
        }
    }
}
```

Note: You are totally free on the names of projects and environments, they are there only for file organization. Only prefixes and URL are used.

## Changelog

2014-02-24 - **0.0.1**

* Initial release

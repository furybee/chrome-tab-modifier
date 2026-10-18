# <img src="public/assets/icon_16.png" alt="icon"> Tabee: Tab Modifier

![GitHub Release](https://img.shields.io/github/v/release/furybee/chrome-tab-modifier?style=flat-square&labelColor=black&v) [![license](https://img.shields.io/badge/license-MIT-ff4081.svg?style=flat-square&labelColor=black)](./LICENSE) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/furybee/chrome-tab-modifier/ci.yml?style=flat-square&label=CI&labelColor=black) [![.nvmrc](https://img.shields.io/badge/.nvmrc-24-00e676.svg?style=flat-square&labelColor=black)](./.nvmrc)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-ffab00.svg?style=flat-square&labelColor=black)](https://conventionalcommits.org) ![pr welcome](https://img.shields.io/badge/PRs-welcome-09FF33.svg?style=flat-square&labelColor=black)

**Tabee renames, re-icons, pins, groups, mutes and protects your Chrome tabs automatically, with rules based on the URL.**

Tabee (formerly **Tab Modifier**) is a free, open source Chrome extension. You write rules that match a URL (*contains*, *starts with*, *ends with*, *exact* or *regex*), and Tabee applies them to every matching tab: a new title, a custom icon, pinning, a tab group, muting, a confirmation before closing, or closing duplicates. Rules stay in your browser; Tabee collects no data.

- **Install:** [Tabee on the Chrome Web Store](https://chromewebstore.google.com/detail/tabee-tab-modifier/penegkenfmliefdbmnfkidlgjfjcidia) (6,000 users, 4.9/5 from 39 ratings)
- **Website, guides and FAQ in 7 languages:** [chrome.furybee.org/extensions/tabee/](https://chrome.furybee.org/extensions/tabee/)
- **License:** MIT

## Why Tabee

Tab extensions solve different problems. Workspace and session managers (Workona, Toby, OneTab, Tab Session Manager) save and reopen *sets* of tabs. Tabee is a tab **modifier**: it changes how each open tab looks and behaves, so you can find and recognize it.

Pick Tabee when you want to:

- **Rename a tab** in Chrome, once (right-click > *Rename Tab*) or every time a site loads (`[PROD] {title}`, `{title} | $2 by $1`, text from the page with `{.css-selector}`).
- **Change a site's favicon**: built-in colored bullets, Chrome icons, emoji, an image URL, or a pasted image.
- **Always pin** Gmail, your calendar or your docs.
- **Group tabs automatically by website** into named, colored Chrome tab groups.
- **Tell staging and production apart** at a glance, with a prefix and a colored icon per environment.
- **Stop closing a tab by accident** (Chrome asks for confirmation before closing or reloading it).
- **Mute noisy sites** as soon as they open, and **keep a single tab** per site.

It also ships Tab Hive (auto-close inactive tabs and restore them from the side panel), Spot Search (`Alt+Shift+E` / `Cmd+Shift+E` to find any tab or bookmark), a window merger (`Alt+Shift+W`), a lightweight mode for heavy sites, and JSON import/export.

Tabee works alongside a session manager: it acts on each tab when it loads, so restored tabs get your rules again.

## Features

* Rename tab (with `{title}`, CSS selectors, URL and title capture groups)
* Change tab icon (bullets, Chrome icons, emoji, URL, pasted image)
* Pin tab
* Group tabs
* Prevent tab closing
* Unique tab (close duplicates)
* Mute tab
* Tab Hive: auto-close inactive tabs, restore them from the side panel
* Spot Search: search open tabs and bookmarks
* Merge all windows
* Lightweight mode
* Import / export rules as JSON

Quick rename can be done by right-clicking anywhere in the page and click on "Rename Tab".

## Installation

Tabee is compatible with Chromium-based browsers.

| Browser        | Install Link                                                                                                | Web Store             |
|----------------|-------------------------------------------------------------------------------------------------------------|-----------------------|
| Google Chrome  | ⬇️ [Install](https://chromewebstore.google.com/detail/tabee-tab-modifier/penegkenfmliefdbmnfkidlgjfjcidia)        | Chrome Web Store      |
| Arc            | ⬇️ [Install](https://chromewebstore.google.com/detail/tabee-tab-modifier/penegkenfmliefdbmnfkidlgjfjcidia)        | Chrome Web Store      |
| Brave          | ⬇️ [Install](https://chromewebstore.google.com/detail/tabee-tab-modifier/penegkenfmliefdbmnfkidlgjfjcidia)        | Chrome Web Store      |
| Opera          | ⬇️ Available Soon                                  | Opera Addons          |
| Microsoft Edge | ⬇️ Available Soon | Microsoft Edge Addons |

Firefox and Safari are not available.

## Usage

* Click on the Tabee icon <img src="public/assets/icon_16.png" alt="icon"> to open Popup or Right-Click then Options.
* Create your tab rules.
* Try & enjoy!

## Why did you build this extension?

I needed a quick UI element in Chrome to know the environment of the tab, as a Web developer I often use multiple versions of the same website: local, pre-production and production.

Not easy to find the appropriate tab when you have multiple tabs called "My awesome website".

I created Tabee (formerly Tab Modifier) to add prefixes to website titles with a specific match.

* [DEV] My awesome website: `.local.domain.com`
* [PREPROD] My awesome website: `.preprod.domain.com`
* [PROD] My awesome website: `.domain.com`

After that, I have added more features like "auto-pin", custom favicons and more.

## Core system

Tabee is based on user *rules* and act on the tab URL that matches the first seen rule. When you open a tab (or refresh), the extension will check if the URL matches a rule and apply the actions.

Aware of that, there is no reason to include a feature that is not "rule-based". Prefer to install specific extensions or create your own.

## Examples

You have infinite possibilities, here are some configurations:

**Distinguish development environments:**

* **Detection**: Contains
* **URL fragment**: localhost
* **Title**: [LOCAL] {title}
* **Icon**: select "bullets > bullet-green"

**Add staging prefix:**

* **Detection**: Contains
* **URL fragment**: staging.yourapp.com
* **Title**: [STAGING] {title}
* **Icon**: select "bullets > bullet-amber"

**Auto-pin documentation tabs:**

* **Detection**: Contains
* **URL fragment**: /docs/
* **Pinned**: ON

**Mute video streaming sites by default:**

* **Detection**: Contains
* **URL fragment**: youtube.com
* **Mute**: ON

**Keep only one email tab open:**

* **Detection**: Starts with
* **URL fragment**: https://mail.google.com
* **Unique**: ON

**Add project info to GitHub repository tabs:**

* **Detection**: Contains
* **URL fragment**: github.com
* **Title**: {title} | $2 by $1
* **URL matcher**: github[.]com/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)

Tab title will be: "user/repo: Description | repo by user"

**Display filename for GitHub file views:**

* **Detection**: RegExp
* **URL fragment**: github[.]com/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)/blob/
* **Title**: {#file-name-id-wide}

**Group all production tabs:**

* **Detection**: Contains
* **URL fragment**: app.yoursite.com
* **Title**: [PROD] {title}
* **Icon**: select "bullets > bullet-red"
* **Group**: Production

And now, build your own... 💪

## Known issues

### Local icon path doesn't work

Related issue: [#5](https://github.com/furybee/chrome-tab-modifier/issues/5)

Due to browser security restrictions, this path won't work: `file://<path>/icon.png`.
Your icon will not be shown by Chrome.

Alternatively, you can upload your icon somewhere like [imgur.com](http://imgur.com/) and paste the direct link in your rule.

Another solution consists in transform your image in the [Data URI format](https://en.wikipedia.org/wiki/Data_URI_scheme). Go to [ezgif.com](https://ezgif.com/image-to-datauri) and paste the given output (the long text) in the icon input on your rule.

### Chrome system pages `chrome://`

Related issues: [#11](https://github.com/furybee/chrome-tab-modifier/issues/11), [#14](https://github.com/furybee/chrome-tab-modifier/issues/14)

Pages that start with `chrome://` URL are protected. No content script can be injected then Tab Modifier will not work on these pages.

### Local files `file:///`

Related issue: [#13](https://github.com/furybee/chrome-tab-modifier/issues/13)

By default, extensions don't have access to local files. You have to opt-in "Allow access to file URLs" from `chrome://extensions/?id=penegkenfmliefdbmnfkidlgjfjcidia`.

### Protected action is not triggered

Related issue: [#95](https://github.com/furybee/chrome-tab-modifier/issues/95)

Since Chrome 90, the JS event that triggers a refresh or a closure has been reworked. See related issue.

## FAQ

**Is Tabee free?**
Yes. No paid plan, no account, no ads. Donations are welcome (see below).

**Is Tabee the same as Tab Modifier?**
Yes. Tabee is the new name of Tab Modifier: same author, same Chrome Web Store listing, same repository.

**Does Tabee collect my data?**
No. There is no analytics and no remote server. Rules, groups and settings are stored locally in your browser (`chrome.storage.local`).

**Why does it need access to all websites?**
To change a page's title and icon, Tabee runs a small content script in that page, and it cannot know in advance which sites your rules target.

**Does it sync my rules across devices?**
No. Rules are stored locally on each computer. Use *Settings > Export* and *Import* to move them.

**Does it support regular expressions?**
Yes: the *Regex* detection, plus URL and title matchers whose capture groups can be reused in the title (`$1`, `@1`). Patterns known to freeze the browser (ReDoS) are rejected.

**Does it work on Edge, Brave or Arc?**
It works in Chromium-based browsers. Brave and Arc install it from the Chrome Web Store; Edge can too once "Allow extensions from other stores" is on. There is no Firefox or Safari version.

More questions and step-by-step guides: [chrome.furybee.org/extensions/tabee/](https://chrome.furybee.org/extensions/tabee/#faq-free).


## Development

In case you want to contribute or just want to play with the code, follow the guide.

### Setup

Download and install [NodeJS](http://nodejs.org/download/) v20+ to get [npm](https://www.npmjs.org/).

💡 Use `nvm` to allow you to quickly install and use different versions of node via the command line.

Clone the project and install dependencies:

```bash
npm install
```

Type `npm run dev` to watch your changes inside `src/` folder or type `npm run build` after each change.

### Load local extension in Chrome

Go to `chrome://extensions/` and enable the "Developer mode".

Click on "Load unpacked extension..." and select the project `dist/` folder.

## Donation

A huge thanks to all donators!

If you like this extension and want to support its development, you can make a donation by clicking one of the links below.

- [Buy Me a Coffee](https://www.buymeacoffee.com/xyugxh7bk)
- [Credit Card](https://donate.stripe.com/fZeg1Sgml971dbieUU)
- [Paypal](https://www.paypal.com/donate/?hosted_button_id=T7KZA4MLT5XTU)

## Security

Tabee takes security seriously. Every code change goes through automated security checks in our CI/CD pipeline:

- **ClamAV Malware Scan**: Detects viruses, trojans, and malware in the codebase
- **Gitleaks Secret Scan**: Prevents hardcoded secrets, API keys, and credentials
- **Dependency Audit**: Checks for known vulnerabilities in dependencies (HIGH severity and above)
- **Test Coverage**: Ensures code quality with comprehensive test suite
- **ReDoS Protection**: Built-in protection against Regular Expression Denial of Service attacks

For detailed security documentation, see [docs/SECURITY.md](docs/SECURITY.md).

## License

See [license](LICENSE.md) file.

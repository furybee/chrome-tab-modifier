/*jshint esversion: 6 */

let w = window;

chrome.storage.local.get('tab_modifier', function (items) {
    if (items.tab_modifier === undefined) {
        return;
    }
    
    let tab_modifier = items.tab_modifier, processPage;
    
    processPage = function () {
        
        let getRule, getTextBySelector, updateTitle, processTitle, processIcon, default_icon, triggerActions;
        
        default_icon = document.querySelectorAll('head link[rel*="icon"]')[0].href;
        
        getRule = function (href) {
            let rule = null;
            
            // Check if a rule is available
            for (let i = 0; i < tab_modifier.rules.length; i++) {
                if (tab_modifier.rules[i].detection === undefined || tab_modifier.rules[i].detection === 'CONTAINS') {
                    if (href.indexOf(tab_modifier.rules[i].url_fragment) !== -1) {
                        rule = tab_modifier.rules[i];
                        break;
                    }
                } else {
                    switch (tab_modifier.rules[i].detection) {
                        case 'STARTS':
                            if (href.startsWith(tab_modifier.rules[i].url_fragment) === true) {
                                rule = tab_modifier.rules[i];
                                break;
                            }
                            break;
                        case 'ENDS':
                            if (href.endsWith(tab_modifier.rules[i].url_fragment) === true) {
                                rule = tab_modifier.rules[i];
                                break;
                            }
                            break;
                        case 'REGEXP':
                            let regexp = new RegExp(tab_modifier.rules[i].url_fragment);
                            
                            if (regexp.test(href) === true) {
                                rule = tab_modifier.rules[i];
                                break;
                            }
                            break;
                    }
                }
            }
            
            return rule;
        };
        
        let rule = getRule(location.href);
        
        /**
         * Returns the text related to the given CSS selector
         * @param selector
         * @returns {string}
         */
        getTextBySelector = function (selector) {
            let el = document.querySelector(selector), value = '';
            
            if (el !== null) {
                el = el.childNodes[0];
                
                if (el.tagName === 'input') {
                    value = el.value;
                } else if (el.tagName === 'select') {
                    value = el.options[el.selectedIndex].text;
                } else {
                    value = el.innerText || el.textContent;
                }
            }
            
            return value.trim();
        };
        
        /**
         * Update title string by replacing given tag by value
         * @param title
         * @param tag
         * @param value
         * @returns {*}
         */
        updateTitle = function (title, tag, value) {
            if (value === '') {
                return title;
            }
            
            return title.replace(tag, value);
        };
        
        /**
         * Process new title depending on current rule, URL & title
         * @param rule
         * @param current_url
         * @param current_title
         * @returns {*}
         */
        processTitle = function (rule, current_url, current_title) {
            // console.log(current_url, current_title);
            let title = rule.tab.title, matches = title.match(/\{([^}]+)}/g), i;
            
            // Handle curly braces tags inside title
            if (matches !== null) {
                let selector, text;
                
                for (i = 0; i < matches.length; i++) {
                    selector = matches[i].substring(1, matches[i].length - 1);
                    text     = getTextBySelector(selector);
                    title    = updateTitle(title, matches[i], text);
                }
            }
            
            // Handle title_matcher
            if (rule.tab.title_matcher !== null) {
                try {
                    matches = current_title.match(new RegExp(rule.tab.title_matcher), 'g');
                    
                    if (matches !== null) {
                        for (i = 0; i < matches.length; i++) {
                            title = updateTitle(title, '@' + i, decodeURIComponent(matches[i]));
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            
            // Handle url_matcher
            if (rule.tab.url_matcher !== null) {
                try {
                    matches = current_url.match(new RegExp(rule.tab.url_matcher), 'g');
                    
                    if (matches !== null) {
                        for (i = 0; i < matches.length; i++) {
                            title = updateTitle(title, '$' + i, decodeURIComponent(matches[i]));
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            
            return title;
        };
        
        /**
         * Remove existing favicon(s) and create a new one
         * @param new_icon
         * @returns {boolean}
         */
        processIcon = function (new_icon) {
            let el, icon, link;
            
            el = document.querySelectorAll('head link[rel*="icon"]');
            
            // Remove existing favicons
            Array.prototype.forEach.call(el, function (node) {
                node.parentNode.removeChild(node);
            });
            
            // Set pre-configured or custom (http|https|data) icon
            icon = (/^(https?|data):/.test(new_icon) === true) ? new_icon : chrome.extension.getURL('/img/' + new_icon);
            
            // Create new favicon
            link      = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel  = 'icon';
            link.href = icon;
            
            document.getElementsByTagName('head')[0].appendChild(link);
            
            return true;
        };
    
        /**
         * Trigger every actions
         * @param rule
         * @param url
         * @param title
         */
        triggerActions = function (rule, url, title) {
            // No rule available
            if (rule === null) {
                return;
            }
            
            // Set title
            if (rule.tab.title !== null) {
                if (title !== null && title !== '') {
                    document.title = processTitle(rule, url, title);
                }
            }
            
            // Pin the tab
            if (rule.tab.pinned === true) {
                chrome.runtime.sendMessage({ action: 'setPinned' });
            }
            
            // Set new icon
            if (rule.tab.icon !== null) {
                processIcon(rule.tab.icon);
                
                let icon_changed_by_me = false, observer_icon;
                
                // Set up a new observer
                observer_icon = new window.WebKitMutationObserver(function (mutations) {
                    if (icon_changed_by_me === true) {
                        icon_changed_by_me = false;
                    } else {
                        mutations.forEach(function (mutation) {
                            // Handle favicon changes
                            if (mutation.target.type === 'image/x-icon') {
                                processIcon(rule.tab.icon);
                                
                                icon_changed_by_me = true;
                            }
                            
                            mutation.addedNodes.forEach(function (added_node) {
                                // Detect added favicon
                                if (added_node.type === 'image/x-icon') {
                                    processIcon(rule.tab.icon);
                                    
                                    icon_changed_by_me = true;
                                }
                            });
                            
                            mutation.removedNodes.forEach(function (removed_node) {
                                // Detect removed favicon
                                if (removed_node.type === 'image/x-icon') {
                                    processIcon(rule.tab.icon);
                                    
                                    icon_changed_by_me = true;
                                }
                            });
                        });
                    }
                });
                
                // Observe when the website has changed the head so the script
                // will detect favicon manipulation (add/remove)
                if (document.querySelector('head link[rel*="icon"]') !== null) {
                    observer_icon.observe(document.querySelector('head link[rel*="icon"]'), {
                        attributes: true,
                        childList: true,
                        characterData: true,
                        subtree: true,
                        attributeOldValue: true,
                        characterDataOldValue: true
                    });
                }
            }
            
            // Protect the tab
            if (rule.tab.protected === true) {
                w.onbeforeunload = function () {
                    return '';
                };
            }
            
            // Keep this tab unique
            if (rule.tab.unique === true) {
                chrome.runtime.sendMessage({
                    action: 'setUnique',
                    url_fragment: rule.url_fragment
                });
            }
            
            // Mute the tab
            if (rule.tab.muted === true) {
                chrome.runtime.sendMessage({ action: 'setMuted' });
            }
        };
        
        let changed_by_me = false, observer_title;
        
        // Set up a new observer
        observer_title = new window.WebKitMutationObserver(function () {
            rule = getRule(location.href);
            
            if (changed_by_me === true) {
                changed_by_me = false;
                
                if (rule !== null) {
                    if (rule.tab.icon !== null) {
                        processIcon(rule.tab.icon);
                    }
                } else {
                    processIcon(default_icon);
                }
                
            } else {
                if (rule !== null) {
                    triggerActions(rule, location.href, document.title);
                } else {
                    processIcon(default_icon);
                }
                
                changed_by_me = true;
            }
        });
        
        // Observe when the website has changed the title
        if (document.querySelector('head > title') !== null) {
            observer_title.observe(document.querySelector('head > title'), {
                subtree: true,
                characterresponse: true,
                childList: true
            });
        }
        
        triggerActions(rule, location.href, document.title);
    };
    
    processPage();
    
    // Reverted #39
    // w.onhashchange = processPage;
    
});

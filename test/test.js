var assert = require('assert'),
    Tab    = require('../src/js/Tab.js'),
    options;

options = {
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
};

describe('Tab', function () {

    var tab1 = Tab.init('http://project.local.com', options);

    describe('http://project.local.com', function () {
        it('should match ".local"', function () {
            assert.equal('[DEV] {title}', tab1.title);
            assert.equal(null, tab1.icon);
            assert.equal(null, tab1.pinned);
        });
    });

    // ----------------------------------------------------------

    var tab2 = Tab.init('http://shop.domain.com', options);

    describe('http://shop.domain.com', function () {
        it('should match ".domain.com"', function () {
            assert.equal('[PROD] {title}', tab2.title);
            assert.equal(null, tab2.icon);
            assert.equal(null, tab2.pinned);
        });
    });

    // ----------------------------------------------------------

    var tab3 = Tab.init('http://youtube.com', options);

    describe('http://youtube.com', function () {
        it('should match "youtube.com"', function () {
            assert.equal(null, tab3.title);
            assert.equal('https://www.google.com/favicon.ico', tab3.icon);
            assert.equal(true, tab3.pinned);
        });
    });

    // ----------------------------------------------------------

    var tab4 = Tab.init('http://twitter.com', options);

    describe('http://twitter.com', function () {
        it('should match "twitter.com"', function () {
            assert.equal('I\'m working hard!', tab4.title);
            assert.equal('{default}', tab4.icon);
            assert.equal(null, tab4.pinned);
        });
    });

    // ----------------------------------------------------------

    var tab5 = Tab.init('http://not-found.com', options);

    describe('http://not-found.com', function () {
        it('should not match anything', function () {
            // Deep equality here as we do not want to compare
            // the references: http://stackoverflow.com/a/14545989/1094611
            assert.deepEqual({}, tab5);
        });
    });

});

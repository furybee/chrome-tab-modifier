var options = {
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

var tab1 = Tab.init('http://project.local.com', options);

QUnit.test('http://project.local.com should match ".local"', function (assert) {
    assert.strictEqual('[DEV] {title}', tab1.title, 'title OK');
    assert.strictEqual(null, tab1.icon, 'icon OK');
    assert.strictEqual(null, tab1.pinned, 'pinned OK');
});

// ----------------------------------------------------------

var tab2 = Tab.init('http://shop.domain.com', options);

QUnit.test('http://shop.domain.com should match "domain.com"', function (assert) {
    assert.strictEqual('[PROD] {title}', tab2.title, 'title OK');
    assert.strictEqual(null, tab2.icon, 'icon OK');
    assert.strictEqual(null, tab2.pinned, 'pinned OK');
});

// ----------------------------------------------------------

var tab3 = Tab.init('http://youtube.com', options);

QUnit.test('http://youtube.com should match "youtube.com"', function (assert) {
    assert.strictEqual(null, tab3.title, 'title OK');
    assert.strictEqual('https://www.google.com/favicon.ico', tab3.icon, 'icon OK');
    assert.strictEqual(true, tab3.pinned, 'pinned OK');
});

// ----------------------------------------------------------

var tab4 = Tab.init('http://twitter.com', options);

QUnit.test('http://twitter.com should match "twitter.com"', function (assert) {
    assert.strictEqual('I\'m working hard!', tab4.title, 'title OK');
    assert.strictEqual('{default}', tab4.icon, 'icon OK');
    assert.strictEqual(null, tab4.pinned, 'pinned OK');
});

// ----------------------------------------------------------

var tab5 = Tab.init('http://not-found.com', options);

QUnit.test('http://not-found.com should not match anything', function (assert) {
    assert.deepEqual({}, tab5, 'empty object');
});

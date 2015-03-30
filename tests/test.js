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

var tab1 = new Tab('http://project.local.domain.com', 'My project', options);

QUnit.test('http://project.local.domain.com should match ".local"', function (assert) {
    assert.strictEqual('[DEV] My project', tab1.getTitle(), 'title OK');
    assert.strictEqual(null, tab1.getIcon(), 'icon OK');
    assert.strictEqual(null, tab1.getPinned(), 'pinned OK');
});

// ----------------------------------------------------------

var tab2 = new Tab('http://shop.domain.com', 'My project', options);

QUnit.test('http://shop.domain.com should match "domain.com"', function (assert) {
    assert.strictEqual('[PROD] My project', tab2.getTitle(), 'title OK');
    assert.strictEqual(null, tab2.getIcon(), 'icon OK');
    assert.strictEqual(null, tab2.getPinned(), 'pinned OK');
});

// ----------------------------------------------------------

var tab3 = new Tab('http://youtube.com', 'My project', options);

QUnit.test('http://youtube.com should match "youtube.com"', function (assert) {
    assert.strictEqual(null, tab3.getTitle(), 'title OK');
    assert.strictEqual('https://www.google.com/favicon.ico', tab3.getIcon(), 'icon OK');
    assert.strictEqual(true, tab3.getPinned(), 'pinned OK');
});

// ----------------------------------------------------------

var tab4 = new Tab('http://twitter.com', 'My project', options);

QUnit.test('http://twitter.com should match "twitter.com"', function (assert) {
    assert.strictEqual('I\'m working hard!', tab4.getTitle(), 'title OK');
    assert.strictEqual('{default}', tab4.getIcon(), 'icon OK');
    assert.strictEqual(null, tab4.getPinned(), 'pinned OK');
});

// ----------------------------------------------------------

var tab5 = new Tab('http://not-found.com', 'My project', options);

QUnit.test('http://not-found.com should not match anything', function (assert) {
    assert.strictEqual(null, tab5.getTitle(), 'title OK');
    assert.strictEqual(null, tab5.getIcon(), 'icon OK');
    assert.strictEqual(null, tab5.getPinned(), 'pinned OK');
});

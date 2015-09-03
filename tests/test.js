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
        "icon": "{default}",
        "protected": true
    },
    "mail.google.com": {
        "unique": true
    },
    "github.com": {
        "title": "[$1::$2] {title}",
        "url_matcher":  "github\\.com\/([A-Za-z0-9\\-\\_]+)\/([A-Za-z0-9\\-\\_]+)"
    }
};

var tab1 = new Tab('http://project.local.domain.com', 'My project', options);

QUnit.test('http://project.local.domain.com should match ".local"', function (assert) {
    assert.strictEqual('.local', tab1.getMatch(), 'match OK');
    assert.strictEqual('[DEV] My project', tab1.getTitle(), 'title OK');
    assert.strictEqual(null, tab1.getIcon(), 'icon OK');
    assert.strictEqual(null, tab1.getPinned(), 'pinned OK');
    assert.strictEqual(null, tab1.getProtected(), 'protected OK');
    assert.strictEqual(null, tab1.getUnique(), 'unique OK');
});

// ----------------------------------------------------------

var tab2 = new Tab('http://shop.domain.com', 'My project', options);

QUnit.test('http://shop.domain.com should match "domain.com"', function (assert) {
    assert.strictEqual('domain.com', tab2.getMatch(), 'match OK');
    assert.strictEqual('[PROD] My project', tab2.getTitle(), 'title OK');
    assert.strictEqual(null, tab2.getIcon(), 'icon OK');
    assert.strictEqual(null, tab2.getPinned(), 'pinned OK');
    assert.strictEqual(null, tab2.getProtected(), 'protected OK');
    assert.strictEqual(null, tab2.getUnique(), 'unique OK');
});

// ----------------------------------------------------------

var tab3 = new Tab('http://youtube.com', 'My project', options);

QUnit.test('http://youtube.com should match "youtube.com"', function (assert) {
    assert.strictEqual('youtube.com', tab3.getMatch(), 'match OK');
    assert.strictEqual(null, tab3.getTitle(), 'title OK');
    assert.strictEqual('https://www.google.com/favicon.ico', tab3.getIcon(), 'icon OK');
    assert.strictEqual(true, tab3.getPinned(), 'pinned OK');
    assert.strictEqual(null, tab3.getProtected(), 'protected OK');
    assert.strictEqual(null, tab3.getUnique(), 'unique OK');
});

// ----------------------------------------------------------

var tab4 = new Tab('http://twitter.com', 'My project', options);

QUnit.test('http://twitter.com should match "twitter.com"', function (assert) {
    assert.strictEqual('twitter.com', tab4.getMatch(), 'match OK');
    assert.strictEqual('I\'m working hard!', tab4.getTitle(), 'title OK');
    assert.strictEqual('{default}', tab4.getIcon(), 'icon OK');
    assert.strictEqual(null, tab4.getPinned(), 'pinned OK');
    assert.strictEqual(true, tab4.getProtected(), 'protected OK');
    assert.strictEqual(null, tab4.getUnique(), 'unique OK');
});

// ----------------------------------------------------------

var tab5 = new Tab('https://mail.google.com/mail/u/0/#inbox', 'My project', options);

QUnit.test('https://mail.google.com/mail/u/0/#inbox should match "mail.google.com"', function (assert) {
    assert.strictEqual('mail.google.com', tab5.getMatch(), 'match OK');
    assert.strictEqual(null, tab5.getTitle(), 'title OK');
    assert.strictEqual(null, tab5.getIcon(), 'icon OK');
    assert.strictEqual(null, tab5.getPinned(), 'pinned OK');
    assert.strictEqual(null, tab5.getProtected(), 'protected OK');
    assert.strictEqual(true, tab5.getUnique(), 'unique OK');
});

// ----------------------------------------------------------

var tab6 = new Tab('https://github.com/user-name/repo_name/pulls/123', 'My project', options);

QUnit.test('https://github.com/user-name/repo_name/pulls/123 should match "github.com"', function (assert) {
    assert.strictEqual('github.com', tab6.getMatch(), 'match OK');
    assert.strictEqual('[user-name::repo_name] My project', tab6.getTitle(), 'title OK');
    assert.strictEqual(null, tab6.getIcon(), 'icon OK');
    assert.strictEqual(null, tab6.getPinned(), 'pinned OK');
    assert.strictEqual(null, tab6.getProtected(), 'protected OK');
    assert.strictEqual(null, tab6.getUnique(), 'unique OK');
});

// ----------------------------------------------------------

var tab7 = new Tab('http://not-found.com', 'My project', options);

QUnit.test('http://not-found.com should not match anything', function (assert) {
    assert.strictEqual(null, tab7.getMatch(), 'match OK');
    assert.strictEqual(null, tab7.getTitle(), 'title OK');
    assert.strictEqual(null, tab7.getIcon(), 'icon OK');
    assert.strictEqual(null, tab7.getPinned(), 'pinned OK');
    assert.strictEqual(null, tab7.getProtected(), 'protected OK');
    assert.strictEqual(null, tab7.getUnique(), 'unique OK');
});

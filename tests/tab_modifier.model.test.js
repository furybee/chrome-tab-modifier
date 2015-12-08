describe('TabModifier model', function () {

    beforeEach(module('TabModifier'));

    var TabModifier, Rule;

    jasmine.getJSONFixtures().fixturesPath = 'base/tests/fixtures';

    beforeEach(inject(function (_TabModifier_, _Rule_) {
        TabModifier = _TabModifier_;
        Rule        = _Rule_;
    }));

    it('Create a tab modifier', function () {
        var tab_modifier = new TabModifier();

        expect(tab_modifier instanceof TabModifier).toBe(true);
        expect(tab_modifier.rules).toBeEmptyArray();
    });

    it('Modify a tab modifier', function () {
        var tab_modifier = new TabModifier();

        tab_modifier.setModel({ new_prop: true });

        expect(tab_modifier.new_prop).toBe(true);
    });

    it('Add a rule', function () {
        var tab_modifier = new TabModifier();

        tab_modifier.addRule(new Rule());

        expect(tab_modifier.rules).toBeArrayOfSize(1);
        expect(tab_modifier.rules[0] instanceof Rule).toBe(true);
    });

    it('Remove a rule', function () {
        var tab_modifier = new TabModifier();

        tab_modifier.addRule(new Rule());
        tab_modifier.addRule(new Rule());

        expect(tab_modifier.rules).toBeArrayOfSize(2);

        tab_modifier.removeRule(tab_modifier.rules[0]);

        expect(tab_modifier.rules).toBeArrayOfSize(1);
    });

    it('Save a rule (create)', function () {
        var tab_modifier = new TabModifier();

        tab_modifier.save(new Rule());

        expect(tab_modifier.rules).toBeArrayOfSize(1);
    });

    it('Save a rule (update)', function () {
        var tab_modifier = new TabModifier();

        tab_modifier.save(new Rule());
        tab_modifier.save(new Rule({ name: 'updated rule' }), 0);

        expect(tab_modifier.rules).toBeArrayOfSize(1);
        expect(tab_modifier.rules[0].name).toBe('updated rule');
    });

    it('Build rules', function () {
        var tab_modifier = new TabModifier();

        tab_modifier.save(new Rule());

        tab_modifier.build(getJSONFixture('tab_modifier.json'));

        expect(tab_modifier.rules).toBeArrayOfSize(7);

        expect(tab_modifier.rules[0].name).toBe('Local dev');
        expect(tab_modifier.rules[0].url_fragment).toBe('.local');
        expect(tab_modifier.rules[0].tab.title).toBe('[DEV] {title}');
        expect(tab_modifier.rules[0].tab.icon).toBe(null);
        expect(tab_modifier.rules[0].tab.pinned).toBe(false);
        expect(tab_modifier.rules[0].tab.protected).toBe(false);
        expect(tab_modifier.rules[0].tab.unique).toBe(false);
        expect(tab_modifier.rules[0].tab.muted).toBe(false);
        expect(tab_modifier.rules[0].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[1].name).toBe('Production');
        expect(tab_modifier.rules[1].url_fragment).toBe('domain.com');
        expect(tab_modifier.rules[1].tab.title).toBe('[PROD] {title}');
        expect(tab_modifier.rules[1].tab.icon).toBe(null);
        expect(tab_modifier.rules[1].tab.pinned).toBe(false);
        expect(tab_modifier.rules[1].tab.protected).toBe(false);
        expect(tab_modifier.rules[1].tab.unique).toBe(false);
        expect(tab_modifier.rules[1].tab.muted).toBe(false);
        expect(tab_modifier.rules[1].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[2].name).toBe('Youtube');
        expect(tab_modifier.rules[2].url_fragment).toBe('youtube.com');
        expect(tab_modifier.rules[2].tab.title).toBe(null);
        expect(tab_modifier.rules[2].tab.icon).toBe('https://www.google.com/favicon.ico');
        expect(tab_modifier.rules[2].tab.pinned).toBe(true);
        expect(tab_modifier.rules[2].tab.protected).toBe(false);
        expect(tab_modifier.rules[2].tab.unique).toBe(false);
        expect(tab_modifier.rules[2].tab.muted).toBe(false);
        expect(tab_modifier.rules[2].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[3].name).toBe('Twitter');
        expect(tab_modifier.rules[3].url_fragment).toBe('twitter.com');
        expect(tab_modifier.rules[3].tab.title).toBe('I\'m working hard!');
        expect(tab_modifier.rules[3].tab.icon).toBe('{default}');
        expect(tab_modifier.rules[3].tab.pinned).toBe(false);
        expect(tab_modifier.rules[3].tab.protected).toBe(true);
        expect(tab_modifier.rules[3].tab.unique).toBe(false);
        expect(tab_modifier.rules[3].tab.muted).toBe(false);
        expect(tab_modifier.rules[3].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[4].name).toBe('Unique GMail');
        expect(tab_modifier.rules[4].url_fragment).toBe('mail.google.com');
        expect(tab_modifier.rules[4].tab.title).toBe(null);
        expect(tab_modifier.rules[4].tab.icon).toBe(null);
        expect(tab_modifier.rules[4].tab.pinned).toBe(false);
        expect(tab_modifier.rules[4].tab.protected).toBe(false);
        expect(tab_modifier.rules[4].tab.unique).toBe(true);
        expect(tab_modifier.rules[4].tab.muted).toBe(false);
        expect(tab_modifier.rules[4].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[5].name).toBe('Pinterest search');
        expect(tab_modifier.rules[5].url_fragment).toBe('pinterest.com/search');
        expect(tab_modifier.rules[5].tab.title).toBe('$1 | Pinterest');
        expect(tab_modifier.rules[5].tab.icon).toBe(null);
        expect(tab_modifier.rules[5].tab.pinned).toBe(false);
        expect(tab_modifier.rules[5].tab.protected).toBe(false);
        expect(tab_modifier.rules[5].tab.unique).toBe(false);
        expect(tab_modifier.rules[5].tab.muted).toBe(false);
        expect(tab_modifier.rules[5].tab.url_matcher).toBe('q=([^&]+)');

        expect(tab_modifier.rules[6].name).toBe('GitHub');
        expect(tab_modifier.rules[6].url_fragment).toBe('github.com');
        expect(tab_modifier.rules[6].tab.title).toBe('{title} | $2 by $1');
        expect(tab_modifier.rules[6].tab.icon).toBe(null);
        expect(tab_modifier.rules[6].tab.pinned).toBe(false);
        expect(tab_modifier.rules[6].tab.protected).toBe(false);
        expect(tab_modifier.rules[6].tab.unique).toBe(false);
        expect(tab_modifier.rules[6].tab.muted).toBe(false);
        expect(tab_modifier.rules[6].tab.url_matcher).toBe('github\\\\.com\\/([A-Za-z0-9\\\\-\\\\_]+)\\/([A-Za-z0-9\\\\-\\\\_]+)');
    });

    it('Get local data', function () {
        pending();
    });

    it('Set local data', function () {
        pending();
    });

    it('Migrate old settings', function () {
        var tab_modifier = new TabModifier();

        tab_modifier.migrateOldSettings(JSON.stringify(getJSONFixture('old_settings.json')));

        expect(tab_modifier.rules).toBeArrayOfSize(7);

        expect(tab_modifier.rules[0].name).toBe('Rule 1');
        expect(tab_modifier.rules[0].url_fragment).toBe('.local');
        expect(tab_modifier.rules[0].tab.title).toBe('[DEV] {title}');
        expect(tab_modifier.rules[0].tab.icon).toBe(null);
        expect(tab_modifier.rules[0].tab.pinned).toBe(false);
        expect(tab_modifier.rules[0].tab.protected).toBe(false);
        expect(tab_modifier.rules[0].tab.unique).toBe(false);
        expect(tab_modifier.rules[0].tab.muted).toBe(false);
        expect(tab_modifier.rules[0].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[1].name).toBe('Rule 2');
        expect(tab_modifier.rules[1].url_fragment).toBe('domain.com');
        expect(tab_modifier.rules[1].tab.title).toBe('[PROD] {title}');
        expect(tab_modifier.rules[1].tab.icon).toBe(null);
        expect(tab_modifier.rules[1].tab.pinned).toBe(false);
        expect(tab_modifier.rules[1].tab.protected).toBe(false);
        expect(tab_modifier.rules[1].tab.unique).toBe(false);
        expect(tab_modifier.rules[1].tab.muted).toBe(false);
        expect(tab_modifier.rules[1].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[2].name).toBe('Rule 3');
        expect(tab_modifier.rules[2].url_fragment).toBe('youtube.com');
        expect(tab_modifier.rules[2].tab.title).toBe(null);
        expect(tab_modifier.rules[2].tab.icon).toBe('https://www.google.com/favicon.ico');
        expect(tab_modifier.rules[2].tab.pinned).toBe(true);
        expect(tab_modifier.rules[2].tab.protected).toBe(false);
        expect(tab_modifier.rules[2].tab.unique).toBe(false);
        expect(tab_modifier.rules[2].tab.muted).toBe(false);
        expect(tab_modifier.rules[2].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[3].name).toBe('Rule 4');
        expect(tab_modifier.rules[3].url_fragment).toBe('twitter.com');
        expect(tab_modifier.rules[3].tab.title).toBe('I\'m working hard!');
        expect(tab_modifier.rules[3].tab.icon).toBe('chrome/default.png');
        expect(tab_modifier.rules[3].tab.pinned).toBe(false);
        expect(tab_modifier.rules[3].tab.protected).toBe(true);
        expect(tab_modifier.rules[3].tab.unique).toBe(false);
        expect(tab_modifier.rules[3].tab.muted).toBe(false);
        expect(tab_modifier.rules[3].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[4].name).toBe('Rule 5');
        expect(tab_modifier.rules[4].url_fragment).toBe('mail.google.com');
        expect(tab_modifier.rules[4].tab.title).toBe(null);
        expect(tab_modifier.rules[4].tab.icon).toBe(null);
        expect(tab_modifier.rules[4].tab.pinned).toBe(false);
        expect(tab_modifier.rules[4].tab.protected).toBe(false);
        expect(tab_modifier.rules[4].tab.unique).toBe(true);
        expect(tab_modifier.rules[4].tab.muted).toBe(false);
        expect(tab_modifier.rules[4].tab.url_matcher).toBe(null);

        expect(tab_modifier.rules[5].name).toBe('Rule 6');
        expect(tab_modifier.rules[5].url_fragment).toBe('pinterest.com/search');
        expect(tab_modifier.rules[5].tab.title).toBe('$1 | Pinterest');
        expect(tab_modifier.rules[5].tab.icon).toBe(null);
        expect(tab_modifier.rules[5].tab.pinned).toBe(false);
        expect(tab_modifier.rules[5].tab.protected).toBe(false);
        expect(tab_modifier.rules[5].tab.unique).toBe(false);
        expect(tab_modifier.rules[5].tab.muted).toBe(false);
        expect(tab_modifier.rules[5].tab.url_matcher).toBe('q=([^&]+)');

        expect(tab_modifier.rules[6].name).toBe('Rule 7');
        expect(tab_modifier.rules[6].url_fragment).toBe('github.com');
        expect(tab_modifier.rules[6].tab.title).toBe('{title} | $2 by $1');
        expect(tab_modifier.rules[6].tab.icon).toBe(null);
        expect(tab_modifier.rules[6].tab.pinned).toBe(false);
        expect(tab_modifier.rules[6].tab.protected).toBe(false);
        expect(tab_modifier.rules[6].tab.unique).toBe(false);
        expect(tab_modifier.rules[6].tab.muted).toBe(false);
        expect(tab_modifier.rules[6].tab.url_matcher).toBe('github\\.com\/([A-Za-z0-9\\-\\_]+)\/([A-Za-z0-9\\-\\_]+)');
    });

    it('Check file before import', function () {
        var tab_modifier = new TabModifier();

        expect(tab_modifier.checkFileBeforeImport(JSON.stringify(getJSONFixture('old_settings.json')))).toBe('INVALID_SETTINGS');
        expect(tab_modifier.checkFileBeforeImport(null)).toBe('INVALID_JSON_FORMAT');
        expect(tab_modifier.checkFileBeforeImport(JSON.stringify(getJSONFixture('tab_modifier.json')))).toBe(true);
        expect(tab_modifier.checkFileBeforeImport()).toBe(false);
    });

    it('Export file', function () {
        pending();
    });

    it('Delete all rules', function () {
        var tab_modifier = new TabModifier();

        tab_modifier.addRule(new Rule());
        tab_modifier.addRule(new Rule());

        expect(tab_modifier.rules).toBeArrayOfSize(2);

        tab_modifier.deleteRules();

        expect(tab_modifier.rules).toBeEmptyArray();
    });

});

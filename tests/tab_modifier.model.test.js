describe('[TabModifier]', function () {

    beforeEach(module('TabModifier'));

    var TabModifier, Rule;

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

});

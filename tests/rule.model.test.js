describe('Rule model', function () {

    beforeEach(module('TabModifier'));

    var Rule;

    beforeEach(inject(function (_Rule_) {
        Rule = _Rule_;
    }));

    it('Create a rule', function () {
        var rule = new Rule();

        expect(rule instanceof Rule).toBe(true);
    });

    it('Modify a rule', function () {
        var rule = new Rule();

        rule.setModel({ name: 'Hello' });

        expect(rule.name).toBe('Hello');
    });

});

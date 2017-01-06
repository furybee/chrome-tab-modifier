app.directive('inputFileButton', function () {
    return {
        restrict: 'E',
        link: function (scope, elem) {
            var button = elem.find('button'),
                input  = elem.find('input');
            
            input.css({ display: 'none' });
            
            button.bind('click', function () {
                input[0].click();
            });
        }
    };
});

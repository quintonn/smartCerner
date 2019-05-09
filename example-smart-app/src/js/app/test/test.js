(function (app)
{
    'use strict';

    TestController.$inject = ['dataService'];

    function TestController(dataService)
    {
        var self = this;
    }

    app.component('test', {
        templateUrl: function ()
        {
            return "./src/js/app/test/test.html";
        },
        controller: TestController,
    });

})(angular.module(constants.appName));

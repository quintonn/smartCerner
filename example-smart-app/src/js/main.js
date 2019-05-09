(function ()
{
    'use strict';

    // register angular module
    angular.module(constants.appName, []);

    var div = document.getElementById('mainApp');
    angular.element(function ()
    {
        angular.bootstrap(div, [constants.appName], { strictDi: true, debugInfoEnabled: true });
    });

})();

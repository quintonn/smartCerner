(function (app)
{
    'use strict';

    submitController.$inject = ['dataService', '$scope'];

    function submitController(dataService, $scope)
    {
        var self = this;

        //self.data = "";
        self.canSubmit = false;

        self.submit = function ()
        {
            if (self.canSubmit == true)
            {
                console.log('can submit');
            }
            else
            {
                console.log('cant submit');
            }
        }

        self.$onInit = function ()
        {
            $scope.$watch(function ()
            {
                return dataService.canSubmit;
            },
                function (newVal, oldVal)
                {
                    console.log('x');
                    if (//dataService.isValid(dataService.error) == false && // check there are no errors in dataService
                        dataService.isValid(dataService.summary) &&
                        dataService.canSubmit == true)
                    {
                        console.log('x');
                        self.canSubmit = true;
                    }
                    else
                    {
                        self.canSubmit = false;
                    }
                });
        }
    }

    app.component('submit', {
        templateUrl: function ()
        {
            return "./src/js/app/submit/submit.html";
        },
        controller: submitController,
    });

})(angular.module(constants.appName));

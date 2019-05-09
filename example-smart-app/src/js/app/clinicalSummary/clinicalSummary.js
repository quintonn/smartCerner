(function (app)
{
    'use strict';

    clinicalSummaryController.$inject = ['dataService', '$scope', '$rootScope'];

    function clinicalSummaryController(dataService, $scope, $rootScope)
    {
        var self = this;

        self.summary = "";
        self.error = "";

        self.approved = false;

        self.approve = function ()
        {
            if (self.approved == false && dataService.isValid(self.summary) == false)
            {
                self.error = "Clinical-Summary is mandatory";
            }
            else
            {
                self.approved = !self.approved;
                dataService.approveSection("summary", self.approved);
                dataService.checkAllApproved();
            }
        }

        self.$onInit = function ()
        {
            $scope.$watch(function ()
            {
                return self.summary;
            },
            function (newVal, oldVal)
            {
                self.error = "";
                if (oldVal != self.summary || dataService.isValid(self.summary) == false)
                {
                    console.log('setting approved to false');
                    self.approved = false;
                    dataService.approveSection("summary", false);
                    dataService.checkAllApproved();
                }
                dataService.summary = newVal;
                var tmp = dataService.fhirMessage;
                if (tmp != null && tmp.entry != null && tmp.entry.length > 0)
                {
                    dataService.fhirMessage.entry[0].resource.section[2].text.div = "<div><table><tbody><tr><th>Clinical Summary</th></tr><tr><td><p>" + newVal + "</p></td></tr></tbody></table></div>";

                    $rootScope.$emit('fhirChange', dataService.fhirMessage);
                }
            });
        }

        setTimeout(function ()
        {
            $scope.$apply();
        }, 10000);
    }

    app.component('clinicalSummary', {
        templateUrl: function ()
        {
            return "./src/js/app/clinicalSummary/clinicalSummary.html?v=2";
        },
        controller: clinicalSummaryController,
    });

})(angular.module(constants.appName));
